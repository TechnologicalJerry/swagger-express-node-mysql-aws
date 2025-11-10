import type { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export type UserRole = 'user' | 'admin';

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload extends BaseJwtPayload {
  sub: string | number;
  uuid: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

