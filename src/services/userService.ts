import { v4 as uuidv4 } from 'uuid';
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  findUserByUuid,
  listUsers,
  updateUser
} from '../repositories/userRepository';
import { hashPassword } from '../utils/password';
import { UserRole } from '../types/auth';

export interface CreateUserServiceInput {
  email: string;
  password: string;
  userName: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  phone: string;
  role?: UserRole;
}

export interface UpdateUserServiceInput {
  email?: string;
  password?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  role?: UserRole;
}

export const getUsers = async () => {
  const users = await listUsers();
  return users.map((user) => sanitize(user));
};

export const getUser = async (uuid: string) => {
  const user = await findUserByUuid(uuid);
  if (!user) {
    throw new Error('User not found');
  }
  return sanitize(user);
};

export const createUserFromAdmin = async (input: CreateUserServiceInput) => {
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
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    dob,
    phone: input.phone,
    role: input.role ?? 'user'
  });

  return sanitize(user);
};

export const updateUserRecord = async (uuid: string, update: UpdateUserServiceInput) => {
  const user = await findUserByUuid(uuid);
  if (!user) {
    throw new Error('User not found');
  }

  if (update.email && update.email !== user.email) {
    const emailUser = await findUserByEmail(update.email);
    if (emailUser && emailUser.id !== user.id) {
      throw new Error('Email already in use');
    }
  }

  const payload: Parameters<typeof updateUser>[1] = {};

  if (update.email !== undefined) payload.email = update.email;
  if (update.firstName !== undefined) payload.firstName = update.firstName;
  if (update.lastName !== undefined) payload.lastName = update.lastName;
  if (update.userName !== undefined) payload.userName = update.userName;
  if (update.gender !== undefined) payload.gender = update.gender;
  if (update.phone !== undefined) payload.phone = update.phone;
  if (update.dob !== undefined) {
    const dobDate = new Date(update.dob);
    if (Number.isNaN(dobDate.getTime())) {
      throw new Error('Invalid date of birth');
    }
    payload.dob = dobDate.toISOString().split('T')[0];
  }
  if (update.role !== undefined) payload.role = update.role;
  if (update.password !== undefined) {
    payload.passwordHash = await hashPassword(update.password);
  }

  const updated = await updateUser(user.id, payload);
  if (!updated) {
    throw new Error('Unable to update user');
  }
  return sanitize(updated);
};

export const deleteUserRecord = async (uuid: string) => {
  const user = await findUserByUuid(uuid);
  if (!user) {
    return false;
  }
  return deleteUser(user.id);
};

const sanitize = (user: Awaited<ReturnType<typeof findUserById>>) => {
  if (!user) {
    throw new Error('User not found');
  }

  return {
    uuid: user.uuid,
    email: user.email,
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    dob: user.dob,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

