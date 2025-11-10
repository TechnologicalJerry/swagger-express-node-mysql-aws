import { Request, Response } from 'express';
import {
  createUserFromAdmin,
  deleteUserRecord,
  getUser,
  getUsers,
  updateUserRecord
} from '../services/userService';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users);
});

export const getUserByUuid = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUser(req.params.uuid);
  res.json(user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await createUserFromAdmin({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role
  });
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserRecord(req.params.uuid, {
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role
  });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await deleteUserRecord(req.params.uuid);
  if (deleted) {
    res.status(204).send();
    return;
  }
  res.status(404).json({ message: 'User not found' });
});

