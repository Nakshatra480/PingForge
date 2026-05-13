import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import asyncHandler from '../lib/async-handler';
import { updateProfileSchema, updatePasswordSchema } from '../lib/validators/settings.validators';
import User from '../models/user.model';
import AppError from '../lib/app-error';
import * as authService from '../services/auth.service';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateProfileSchema.parse(req.body);

  // Build a flat $set map using dot notation to avoid wiping sibling fields
  const setMap: Record<string, any> = {};
  if (data.name !== undefined) setMap.name = data.name;
  if (data.email !== undefined) setMap.email = data.email;
  if (data.title !== undefined) setMap.title = data.title;
  if (data.company !== undefined) setMap.company = data.company;
  if (data.phone !== undefined) setMap.phone = data.phone;
  if (data.preferences) {
    const { defaultTone, defaultMessageType, smtp } = data.preferences;
    if (defaultTone !== undefined) setMap['preferences.defaultTone'] = defaultTone;
    if (defaultMessageType !== undefined) setMap['preferences.defaultMessageType'] = defaultMessageType;
    if (smtp !== undefined) {
      if (smtp.host !== undefined) setMap['preferences.smtp.host'] = smtp.host;
      if (smtp.port !== undefined) setMap['preferences.smtp.port'] = smtp.port;
      if (smtp.user !== undefined) setMap['preferences.smtp.user'] = smtp.user;
      if (smtp.pass !== undefined) setMap['preferences.smtp.pass'] = smtp.pass;
      if (smtp.fromName !== undefined) setMap['preferences.smtp.fromName'] = smtp.fromName;
      if (smtp.fromEmail !== undefined) setMap['preferences.smtp.fromEmail'] = smtp.fromEmail;
    }
  }

  console.log('[settings] setMap being applied:', JSON.stringify(setMap, null, 2));
  const user = await User.findByIdAndUpdate(req.user!.id, { $set: setMap }, { new: true });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  console.log('[settings] saved preferences.smtp:', JSON.stringify(user.preferences?.smtp));
  res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, title: (user as any).title, company: (user as any).company, phone: (user as any).phone, preferences: user.preferences } });

});

export const getSmtpStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  const smtp = user.preferences?.smtp;
  res.json({
    success: true,
    data: {
      configured: !!(smtp?.host && smtp?.user && smtp?.pass),
      host: smtp?.host || null,
      port: smtp?.port || null,
      user: smtp?.user || null,
      fromName: smtp?.fromName || null,
      fromEmail: smtp?.fromEmail || null,
      hasPassword: !!(smtp?.pass),
    }
  });
});


export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const data = updatePasswordSchema.parse(req.body);
  const user = await User.findById(req.user!.id).select('+password');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const isValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD');

  user.password = await bcrypt.hash(data.newPassword, 12);
  await user.save();
  await authService.invalidateRefreshTokens(req.user!.id);

  res.json({ success: true, data: { message: 'Password updated' } });
});
