import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { UserDocument } from '../models/user.model';
import AppError from '../lib/app-error';
import env from '../config/env';

const generateAccessToken = (user: UserDocument): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    options
  );
};

const generateRefreshToken = (user: UserDocument): string => {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(
    { id: user._id.toString(), version: user.refreshTokenVersion },
    env.JWT_REFRESH_SECRET,
    options
  );
};

export const register = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };

  return { user: userResponse, accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password +refreshTokenVersion');
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };

  return { user: userResponse, accessToken, refreshToken };
};

export const refresh = async (refreshTokenValue: string) => {
  try {
    const decoded = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as {
      id: string;
      version: number;
    };

    const user = await User.findById(decoded.id).select('+refreshTokenVersion');
    if (!user || user.refreshTokenVersion !== decoded.version) {
      throw new AppError('Invalid refresh token', 401, 'REFRESH_INVALID');
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid refresh token', 401, 'REFRESH_INVALID');
  }
};

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
};

export const invalidateRefreshTokens = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
};
