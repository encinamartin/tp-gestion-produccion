// ==========================================
// 1. IMPORTACIÓN DE LIBRERÍAS Y CONTROLADORES
// ==========================================
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

// Inicialización del enrutador de Express
const router = Router();

// ==========================================
// 2. DEFINICIÓN DE RUTAS Y MIDDLEWARES
// ==========================================

/**
 * @route   GET /api/orders
 * @desc    Obtiene el listado completo de órdenes de producción
 * @access  Privado (Requiere token JWT válido)
 */
router.get('/', authenticateToken, getOrders);

/**
 * @route   POST /api/orders
 * @desc    Crea una nueva orden de producción en estado "pendiente"
 * @access  Privado / Restringido (Requiere token JWT y rol 'planificador')
 */
router.post('/', authenticateToken, authorizeRoles('planificador'), createOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualiza el estado de la orden y gestiona el stock según el ciclo de vida
 * @access  Privado (Requiere token JWT válido)
 */
router.patch('/:id/status', authenticateToken, updateOrderStatus);

// ==========================================
// 3. EXPORTACIÓN DE LAS RUTAS
// ==========================================
export default router;