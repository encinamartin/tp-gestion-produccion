import { Router } from 'express';
import { getProducts, createProduct, updateStock } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getProducts);
router.post('/', authenticateToken, authorizeRoles('planificador'), createProduct);
router.patch('/:id/stock', authenticateToken, updateStock);

export default router;