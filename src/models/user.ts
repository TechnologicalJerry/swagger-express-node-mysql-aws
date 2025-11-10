import { UserRole } from '../types/auth';

export interface UserRecord {
  id: number;
  uuid: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'passwordHash'>> & {
  passwordHash?: string;
};

