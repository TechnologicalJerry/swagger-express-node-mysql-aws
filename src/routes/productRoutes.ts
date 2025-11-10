import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getProductByUuid,
  listProducts,
  updateProduct
} from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.get('/', listProducts);

router.get(
  '/:uuid',
  [param('uuid').isUUID().withMessage('Valid uuid required')],
  validateRequest,
  getProductByUuid
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('description').optional().isString()
  ],
  validateRequest,
  createProduct
);

router.patch(
  '/:uuid',
  authenticate,
  authorize('admin'),
  [
    param('uuid').isUUID().withMessage('Valid uuid required'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a valid number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('description').optional().isString()
  ],
  validateRequest,
  updateProduct
);

router.delete(
  '/:uuid',
  authenticate,
  authorize('admin'),
  [param('uuid').isUUID().withMessage('Valid uuid required')],
  validateRequest,
  deleteProduct
);

export default router;

