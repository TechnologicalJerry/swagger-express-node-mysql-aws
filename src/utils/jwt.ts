import jwt, { JwtPayload as BaseJwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import { AuthenticatedUser, JwtPayload } from '../types/auth';

export const signJwt = (user: AuthenticatedUser): string => {
  const payload: JwtPayload = {
    sub: user.id.toString(),
    uuid: user.uuid,
    email: user.email,
    role: user.role
  };

  const options: SignOptions = { expiresIn: env.jwtExpiresIn };

  return jwt.sign(payload, env.jwtSecret as Secret, options);
};

export const verifyJwt = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.jwtSecret as Secret);

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }

  const payload = decoded as BaseJwtPayload & Partial<JwtPayload>;

  if (!payload.uuid || !payload.email || !payload.role) {
    throw new Error('Invalid token payload');
  }

  const subjectRaw =
    typeof payload.sub === 'string' ? Number.parseInt(payload.sub, 10) : payload.sub;

  if (subjectRaw === undefined || Number.isNaN(subjectRaw)) {
    throw new Error('Invalid token payload');
  }

  return {
    sub: subjectRaw,
    uuid: payload.uuid,
    email: payload.email,
    role: payload.role,
    iat: payload.iat,
    exp: payload.exp
  };
};

