import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import { registerSchema, loginSchema } from '../lib/validators/auth.validators';
import * as authService from '../services/auth.service';
import env from '../config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data.name, data.email, data.password);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data.email, data.password);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
    return;
  }

  const result = await authService.refresh(token);

  res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { accessToken: result.accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.invalidateRefreshTokens(req.user.id);
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  res.json({ success: true, data: { message: 'Logged out' } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.json({ success: true, data: user });
});
