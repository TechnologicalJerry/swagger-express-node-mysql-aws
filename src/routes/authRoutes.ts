import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register, forgot, reset } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords must match'),
    body('userName').notEmpty().withMessage('Username required'),
    body('firstName').notEmpty().withMessage('First name required'),
    body('lastName').notEmpty().withMessage('Last name required'),
    body('gender').notEmpty().withMessage('Gender required'),
    body('dob').isISO8601().toDate().withMessage('Valid date of birth required'),
    body('phone').notEmpty().withMessage('Phone number required')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validateRequest,
  login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required')],
  validateRequest,
  forgot
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  reset
);

router.get('/me', authenticate, me);

export default router;

