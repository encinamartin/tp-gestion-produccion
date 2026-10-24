import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Supplier } from '../models/Supplier';

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pyme_produccion');
    console.log('Conectado a MongoDB para la migración inicial...');

    // Limpiar colecciones anteriores
    await User.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});

    // 1. Crear usuarios por defecto (Planificador y Operario)
    const passPlanificador = await bcrypt.hash('planificador123', 10);
    const passOperario = await bcrypt.hash('operario123', 10);

    const planificador = await User.create({
      nombre: 'Carlos Planificador',
      email: 'planificador@pyme.com',
      password: passPlanificador,
      rol: 'planificador'
    });

    const operario = await User.create({
      nombre: 'Juan Operario',
      email: 'operario@pyme.com',
      password: passOperario,
      rol: 'operario'
    });

    // 2. Crear Insumos
    const harina = await Product.create({
      nombre: 'Harina de Trigo',
      codigo: 'INS-001',
      tipo: 'insumo',
      stock: 500,
      unidadMedida: 'kg'
    });

    const levadura = await Product.create({
      nombre: 'Levadura Seca',
      codigo: 'INS-002',
      tipo: 'insumo',
      stock: 50,
      unidadMedida: 'kg'
    });

    // 3. Crear Producto Terminado con su Receta
    await Product.create({
      nombre: 'Pan Artesanal (Lote 100u)',
      codigo: 'PRD-001',
      tipo: 'producto_terminado',
      stock: 0,
      unidadMedida: 'lotes',
      receta: [
        { insumo: harina._id, cantidadRequerida: 50 },
        { insumo: levadura._id, cantidadRequerida: 2 }
      ]
    });

    // 4. Crear Proveedor
    await Supplier.create({
      nombre: 'Distribuidora Molinos S.A.',
      contacto: 'Roberto Gómez',
      telefono: '11-4444-5555',
      email: 'ventas@molinos.com'
    });

    console.log('¡Migración inicial de datos completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
  }
};

runSeed();