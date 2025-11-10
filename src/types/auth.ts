import type { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export type UserRole = 'user' | 'admin';

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  email: string;
  role: UserRole;
}

export type JwtPayload = BaseJwtPayload & {
  sub: string;
  uuid: string;
  email: string;
  role: UserRole;
};

