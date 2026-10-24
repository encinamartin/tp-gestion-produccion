import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import { logger } from './utils/logger';
import supplierRoutes from './routes/supplier.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de comprobación (Health check)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Servidor activo' });
});

// Middleware global para manejo de errores
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error(`Error no controlado: ${err.message}`);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
app.use('/api/suppliers', supplierRoutes);

export default app;