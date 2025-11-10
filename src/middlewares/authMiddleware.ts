import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { findUserById } from '../repositories/userRepository';
import { AuthenticatedUser } from '../types/auth';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = header.replace('Bearer ', '').trim();

    const payload = verifyJwt(token);
    const userId = Number.parseInt(payload.sub, 10);
    if (Number.isNaN(userId)) {
      return res.status(401).json({ message: 'Invalid token subject' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role
    };

    req.user = authUser;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize =
  (...roles: AuthenticatedUser['role'][]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };

