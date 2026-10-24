import { Request, Response } from 'express';
import { Supplier, Purchase } from '../models/Supplier';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';

// Listar proveedores
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    logger.error(`Error al obtener proveedores: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo proveedor
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    logger.error(`Error al crear proveedor: ${error}`);
    res.status(400).json({ message: 'Error en los datos del proveedor', error });
  }
};

// Registrar compra de insumos (aumenta el stock)
export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proveedor, insumo, cantidad, precioUnitario } = req.body;

    const purchase = new Purchase({ proveedor, insumo, cantidad, precioUnitario });
    await purchase.save();

    // Incrementar el stock del insumo comprado
    await Product.findByIdAndUpdate(insumo, {
      $inc: { stock: cantidad }
    });

    res.status(201).json({ message: 'Compra registrada y stock actualizado', purchase });
  } catch (error) {
    logger.error(`Error al registrar compra: ${error}`);
    res.status(400).json({ message: 'Error al registrar la compra', error });
  }
};