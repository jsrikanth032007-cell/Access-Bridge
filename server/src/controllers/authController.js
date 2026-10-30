import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { UserService, ProfileService } from '../services/storeService.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await UserService.findByEmail(validatedData.email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const user = await UserService.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    const userId = user._id || user.id;

    // Create initial profile for user
    const profile = await ProfileService.findByUserId(userId);

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to AccessBridge!',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await UserService.findByEmail(validatedData.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isMatch = await UserService.verifyPassword(user, validatedData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);
    const profile = await ProfileService.findByUserId(userId);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);

    res.json({
      success: true,
      user: {
        id: userId,
        name: req.user.name,
        email: req.user.email,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};
