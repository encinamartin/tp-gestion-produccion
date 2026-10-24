import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('producto', 'nombre codigo receta')
      .populate('creadoPor', 'nombre email')
      .populate('asignadoA', 'nombre email');
    res.status(200).json(orders);
  } catch (error) {
    logger.error(`Error al obtener órdenes: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { producto, cantidad, fechaEntregaComprometida } = req.body;

    const newOrder = new Order({
      producto,
      cantidad,
      fechaEntregaComprometida,
      creadoPor: req.user?.id
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    logger.error(`Error al crear orden de producción: ${error}`);
    res.status(400).json({ message: 'Error al crear la orden', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const order = await Order.findById(id).populate('producto');
    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    // Si la orden pasa a 'terminada', impactamos el stock
    if (estado === 'terminada' && order.estado !== 'terminada') {
      const product = await Product.findById(order.producto).populate('receta.insumo');

      if (product && product.receta && product.receta.length > 0) {
        // Verificar stock de insumos
        for (const item of product.receta) {
          const insumo = await Product.findById(item.insumo);
          const cantidadNecesaria = item.cantidadRequerida * order.cantidad;

          if (!insumo || insumo.stock < cantidadNecesaria) {
            res.status(400).json({
              message: `Stock insuficiente para el insumo: ${insumo?.nombre || 'Desconocido'}`
            });
            return;
          }
        }

        // Descontar insumos
        for (const item of product.receta) {
          const cantidadNecesaria = item.cantidadRequerida * order.cantidad;
          await Product.findByIdAndUpdate(item.insumo, {
            $inc: { stock: -cantidadNecesaria }
          });
        }
      }

      // Sumar stock al producto terminado
      if (product) {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: order.cantidad }
        });
      }
    }

    order.estado = estado;
    if (req.user?.id) order.asignadoA = req.user.id as any;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    logger.error(`Error al actualizar estado de la orden: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
