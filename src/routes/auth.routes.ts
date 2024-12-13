import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  login,
  register,
  getProfile,
  updateProfile
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export const authRoutes = router;