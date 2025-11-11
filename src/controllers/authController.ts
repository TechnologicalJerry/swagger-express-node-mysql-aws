import { Request, Response } from 'express';
import {
  forgotPassword,
  getProfile,
  loginUser,
  registerUser,
  resetPassword
} from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const rawDob = req.body.dob;
  const dob =
    rawDob instanceof Date
      ? rawDob.toISOString().split('T')[0]
      : typeof rawDob === 'string'
      ? rawDob
      : '';

  const result = await registerUser({
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    dob,
    phone: req.body.phone
  });

  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser({
    email: req.body.email,
    password: req.body.password
  });

  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getProfile(req.user!.uuid);
  res.json(profile);
});

export const forgot = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPassword(req.body.email);
  res.json(result);
});

export const reset = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetPassword({
    token: req.body.token,
    password: req.body.password
  });
  res.json(result);
});

