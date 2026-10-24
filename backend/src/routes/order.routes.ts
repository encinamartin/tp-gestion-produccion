import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getOrders);
router.post('/', authenticateToken, authorizeRoles('planificador'), createOrder);
router.patch('/:id/status', authenticateToken, updateOrderStatus);

export default router;