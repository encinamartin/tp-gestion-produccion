// ==========================================
// 1. IMPORTACIÓN DE MÓDULOS Y MODELOS
// ==========================================
import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

// ==========================================
// 2. OBTENER TODAS LAS ÓRDENES DE PRODUCCIÓN
// ==========================================
/**
 * Consulta la lista completa de órdenes de producción registradas en la base de datos.
 * Realiza .populate() sobre los productos e información de usuarios creadores/asignados.
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('producto', 'nombre codigo receta')
      .populate('creadoPor', 'nombre email')
      .populate('asignadoA', 'nombre email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    logger.error(`Error al obtener órdenes: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ==========================================
// 3. CREAR UNA NUEVA ÓRDEN DE PRODUCCIÓN
// ==========================================
/**
 * Registra una nueva orden en estado inicial "pendiente".
 * Asigna automáticamente la autoría al usuario autenticado (Planificador).
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { producto, productoId, cantidad, fechaEntregaComprometida } = req.body;
    const targetProduct = producto || productoId;

    if (!targetProduct) {
      res.status(400).json({ message: 'El producto es obligatorio' });
      return;
    }

    // Instancia de la nueva orden asociando el ID del usuario
    const newOrder = new Order({
      producto: targetProduct,
      cantidad: Number(cantidad),
      fechaEntregaComprometida,
      creadoPor: req.user?.id,
    });

    await newOrder.save();

    // Poblamos la respuesta para que retorne los datos del producto al frontend inmediatamente
    const populatedOrder = await Order.findById(newOrder._id).populate(
      'producto',
      'nombre codigo receta'
    );

    res.status(201).json(populatedOrder);
  } catch (error) {
    logger.error(`Error al crear orden de producción: ${error}`);
    res.status(400).json({ message: 'Error al crear la orden de producción', error });
  }
};

// ==========================================
// 4. ACTUALIZAR ESTADO DE ÓRDEN Y GESTIONAR STOCK
// ==========================================
/**
 * Modifica el estado operacional de la orden (pendiente -> en_proceso -> terminada / cancelada).
 * Gestiona automáticamente el consumo de insumos y el alta de producto final.
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Buscar la orden por ID
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    // ------------------------------------------------------------------
    // FASE 1: Transición a "en_proceso" -> Descuento automático de insumos
    // ------------------------------------------------------------------
    if (estado === 'en_proceso' && order.estado === 'pendiente') {
      const product = await Product.findById(order.producto);

      if (product && product.receta && product.receta.length > 0) {
        // A) Validar que haya stock suficiente para cada insumo de la receta (BOM)
        for (const item of product.receta) {
          const insumoDoc = await Product.findById(item.insumo);
          const cantidadNecesaria = item.cantidadRequerida * order.cantidad;

          if (!insumoDoc || insumoDoc.stock < cantidadNecesaria) {
            res.status(400).json({
              message: `Stock insuficiente del insumo "${
                insumoDoc?.nombre || 'Desconocido'
              }". Requerido: ${cantidadNecesaria}, Disponible: ${insumoDoc?.stock || 0}`,
            });
            return;
          }
        }

        // B) Descontar el stock de insumos una vez verificados todos
        for (const item of product.receta) {
          const cantidadNecesaria = item.cantidadRequerida * order.cantidad;
          await Product.findByIdAndUpdate(item.insumo, {
            $inc: { stock: -cantidadNecesaria },
          });
        }
      }
    }

    // ------------------------------------------------------------------
    // FASE 2: Transición a "terminada" -> Sumar Producto Final al Stock
    // ------------------------------------------------------------------
    if (estado === 'terminada' && order.estado !== 'terminada') {
      await Product.findByIdAndUpdate(order.producto, {
        $inc: { stock: order.cantidad },
      });
    }

    // Actualizar campos de estado y usuario asignado/responsable
    order.estado = estado;
    if (req.user?.id) {
      order.asignadoA = req.user.id as any;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('producto', 'nombre codigo receta')
      .populate('creadoPor', 'nombre email')
      .populate('asignadoA', 'nombre email');

    res.status(200).json(updatedOrder);
  } catch (error) {
    logger.error(`Error al actualizar estado de la orden: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};