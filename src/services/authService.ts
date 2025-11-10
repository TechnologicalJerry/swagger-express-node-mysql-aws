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

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

const toAuthenticatedUser = (user: Awaited<ReturnType<typeof findUserById>>): AuthenticatedUser => {
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
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    uuid: uuidv4(),
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    passwordHash,
    role: 'user'
  });

  const authUser = toAuthenticatedUser(user);

  return {
    user: sanitizeUser(authUser, user.firstName, user.lastName),
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
    user: sanitizeUser(authUser, user.firstName, user.lastName),
    token: signJwt(authUser)
  };
};

export const getProfile = async (uuid: string) => {
  const user = await findUserByUuid(uuid);
  if (!user) {
    throw new Error('User not found');
  }

  return sanitizeUser(toAuthenticatedUser(user), user.firstName, user.lastName);
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

const sanitizeUser = (user: AuthenticatedUser, firstName: string, lastName: string) => ({
  uuid: user.uuid,
  email: user.email,
  role: user.role,
  firstName,
  lastName
});

