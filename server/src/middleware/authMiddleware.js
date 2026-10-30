import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserService } from '../services/storeService.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await UserService.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session has expired or user does not exist.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
    next(error);
  }
};

