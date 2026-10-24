import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

describe('Pruebas del Módulo de Órdenes y Stock (/api/orders)', () => {
  let token: string;
  let userId: string;
  let insumoId: string;
  let productoId: string;

  beforeAll(async () => {
    // 1. Limpieza inicial
    await User.deleteMany({ email: 'order_test@pyme.com' });
    await Product.deleteMany({ codigo: { $in: ['TEST-INS', 'TEST-PROD'] } });
    await Order.deleteMany({});

    // 2. Registrar usuario planificador
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Planificador Test',
        email: 'order_test@pyme.com',
        password: 'password123',
        rol: 'planificador',
      });

    // 3. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'order_test@pyme.com', password: 'password123' });
    
    token = loginRes.body.token;

    const userObj = await User.findOne({ email: 'order_test@pyme.com' });
    userId = (userObj?._id as any).toString();

    // 4. Crear un Insumo con stock inicial = 100
    const insumo = new Product({
      nombre: 'Harina Test',
      codigo: 'TEST-INS',
      tipo: 'insumo',
      unidadMedida: 'kg',
      stock: 100,
    });
    await insumo.save();
    insumoId = (insumo._id as any).toString();

    // 5. Crear Producto Terminado con Receta (requiere 2kg de insumo por unidad)
    const producto = new Product({
      nombre: 'Pan Test',
      codigo: 'TEST-PROD',
      tipo: 'producto_terminado',
      unidadMedida: 'unidades',
      stock: 0,
      receta: [{ insumo: insumoId, cantidadRequerida: 2 }],
    });
    await producto.save();
    productoId = (producto._id as any).toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'order_test@pyme.com' });
    await Product.deleteMany({ codigo: { $in: ['TEST-INS', 'TEST-PROD'] } });
    await Order.deleteMany({});
    await mongoose.connection.close();
  });

  it('Debe crear una orden de producción correctamente', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        producto: productoId,
        cantidad: 10,
        fechaEntregaComprometida: new Date(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.estado).toBe('pendiente');
  });

  it('Debe descontar stock de insumos y sumar al producto al completar la orden', async () => {
    // Crear la orden en estado 'pendiente'
    const order = new Order({
      producto: productoId,
      cantidad: 10,
      fechaEntregaComprometida: new Date(),
      creadoPor: userId,
    });
    await order.save();

    // Paso 1: Transición 'pendiente' -> 'en_proceso' (AQUÍ SE DESCUENTAN INSUMOS)
    const resInproceso = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'en_proceso' });

    expect(resInproceso.status).toBe(200);

    // Verificar que el insumo bajó de 100kg a 80kg (100 - (10 * 2kg))
    const insumoProcesado = await Product.findById(insumoId);
    expect(insumoProcesado?.stock).toBe(80);

    // Paso 2: Transición 'en_proceso' -> 'terminada' (AQUÍ SE INGRESA EL PRODUCTO)
    const resTerminada = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'terminada' });

    expect(resTerminada.status).toBe(200);

    // Verificar que el producto terminado subió de 0 a 10 unidades
    const productoTerminado = await Product.findById(productoId);
    expect(productoTerminado?.stock).toBe(10);
  });
});