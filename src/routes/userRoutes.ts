import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createUser,
  deleteUser,
  getUserByUuid,
  listUsers,
  updateUser
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', listUsers);

router.post(
  '/',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name required'),
    body('lastName').notEmpty().withMessage('Last name required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  validateRequest,
  createUser
);

router.get('/:uuid', [param('uuid').isUUID().withMessage('Valid uuid required')], validateRequest, getUserByUuid);

router.patch(
  '/:uuid',
  [
    param('uuid').isUUID().withMessage('Valid uuid required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  validateRequest,
  updateUser
);

router.delete(
  '/:uuid',
  [param('uuid').isUUID().withMessage('Valid uuid required')],
  validateRequest,
  deleteUser
);

export default router;

