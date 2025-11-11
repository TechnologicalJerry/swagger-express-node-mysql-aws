import { v4 as uuidv4 } from 'uuid';
import env from '../config/env';
import {
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed
} from '../repositories/passwordResetRepository';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUuid,
  updateUser
} from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../utils/password';
import { signJwt } from '../utils/jwt';
import { AuthenticatedUser } from '../types/auth';
import { UserRecord } from '../models/user';

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

const toAuthenticatedUser = (user: UserRecord | null): AuthenticatedUser => {
  if (!user) {
    throw new Error('User not found');
  }
  return {
    id: user.id,
    uuid: user.uuid,
    email: user.email,
    role: user.role
  };
};

export const registerUser = async (input: RegisterInput) => {
  if (input.password !== input.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already in use');
  }

  const dobDate = new Date(input.dob);
  if (Number.isNaN(dobDate.getTime())) {
    throw new Error('Invalid date of birth');
  }
  const dob = dobDate.toISOString().split('T')[0];

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    uuid: uuidv4(),
    email: input.email,
    userName: input.userName,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    dob,
    phone: input.phone,
    passwordHash,
    role: 'user'
  });

  const authUser = toAuthenticatedUser(user);

  return {
    user: sanitizeUser(user),
    token: signJwt(authUser)
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const authUser = toAuthenticatedUser(user);

  return {
    user: sanitizeUser(user),
    token: signJwt(authUser)
  };
};

export const getProfile = async (uuid: string) => {
  const user = await findUserByUuid(uuid);
  if (!user) {
    throw new Error('User not found');
  }

  return sanitizeUser(user);
};

export const forgotPassword = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // obscure actual existence
    return { message: 'If the email exists, a reset token has been generated.' };
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + env.resetTokenExpiryMinutes * 60 * 1000);
  await createPasswordResetToken(user.id, token, expiresAt);

  return {
    message: 'Password reset token generated.',
    token,
    expiresAt
  };
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const record = await findValidPasswordResetToken(input.token);
  if (!record) {
    throw new Error('Invalid or expired token');
  }

  const user = await findUserById(record.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const passwordHash = await hashPassword(input.password);
  await updateUser(user.id, { passwordHash });
  await markPasswordResetTokenUsed(record.id);

  return { message: 'Password updated successfully.' };
};

const sanitizeUser = (user: UserRecord) => ({
  uuid: user.uuid,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  userName: user.userName,
  gender: user.gender,
  dob: user.dob,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

