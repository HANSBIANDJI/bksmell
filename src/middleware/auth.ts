import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Basic authentication middleware
export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No auth token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Please authenticate' });
  }
};

// Simplified middleware just for admin access
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No auth token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { role: string };

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Please authenticate as admin' });
  }
};