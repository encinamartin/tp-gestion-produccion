import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';

export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().populate('receta.insumo', 'nombre codigo unidadMedida');
    res.status(200).json(products);
  } catch (error) {
    logger.error(`Error al obtener productos: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error(`Error al crear producto: ${error}`);
    res.status(400).json({ message: 'Error en los datos del producto', error });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { stock } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error(`Error al actualizar stock: ${error}`);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};