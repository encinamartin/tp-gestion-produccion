import { Router } from 'express';
import { getSuppliers, createSupplier, createPurchase } from '../controllers/supplier.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getSuppliers);
router.post('/', authenticateToken, authorizeRoles('planificador'), createSupplier);
router.post('/purchases', authenticateToken, authorizeRoles('planificador'), createPurchase);

export default router;