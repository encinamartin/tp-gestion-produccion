// ==========================================
// 1. IMPORTACIÓN DE LIBRERÍAS Y MÓDULOS
// ==========================================
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

// Importación de las rutas de la API
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import supplierRoutes from './routes/supplier.routes';

// ==========================================
// 2. CONFIGURACIÓN INICIAL Y ENTORNO
// ==========================================
// Carga de variables de entorno desde el archivo .env
dotenv.config();

// Inicialización de la aplicación Express y definición del puerto
const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 3. MIDDLEWARES GLOBALES
// ==========================================
// Habilita el intercambio de recursos de origen cruzado (CORS) para llamadas desde el cliente web
app.use(cors());

// Parsea las solicitudes entrantes con JSON en el cuerpo del mensaje (req.body)
app.use(express.json());

// ==========================================
// 4. CONEXIÓN A BASE DE DATOS
// ==========================================
// Establece la conexión persistente con MongoDB
connectDB();

// ==========================================
// 5. REGISTRO DE RUTAS PRINCIPALES (API)
// ==========================================
// Endpoint para autenticación y usuarios (login/register/roles)
app.use('/api/auth', authRoutes);

// Endpoint para gestión de inventario, insumos y recetas de productos
app.use('/api/products', productRoutes);

// Endpoint para creación y seguimiento de órdenes de producción
app.use('/api/orders', orderRoutes);

// Endpoint para la administración de proveedores
app.use('/api/suppliers', supplierRoutes);

// ==========================================
// 6. RUTA DE COMPROBACIÓN DE ESTADO (HEALTH CHECK)
// ==========================================
// Permite verificar el estado operacional del servidor en tiempo real
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Servidor activo' });
});

// ==========================================
// 7. MIDDLEWARE DE MANEJO GLOBAL DE ERRORES
// ==========================================
// Captura y registra cualquier error no controlado enviado a través de next(err)
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error(`Error no controlado: ${err.message}`);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor' });
});

// ==========================================
// 8. INICIALIZACIÓN DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;