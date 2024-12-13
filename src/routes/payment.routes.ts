import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getPaymentMethods,
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus
} from '../controllers/payment.controller';
import { paymentValidation } from '../validations/payment.validation';

const router = Router();

router.get('/methods', getPaymentMethods);
router.post('/intent', auth, paymentValidation, createPaymentIntent);
router.post('/confirm/:id', auth, confirmPayment);
router.get('/status/:id', auth, getPaymentStatus);

export const paymentRoutes = router;