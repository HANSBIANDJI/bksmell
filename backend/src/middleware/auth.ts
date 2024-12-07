import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Basic authentication middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Simplified middleware just for admin access
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminKey = req.header('X-Admin-Key');
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};