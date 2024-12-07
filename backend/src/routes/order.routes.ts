import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../controllers/order.controller';

const router = Router();

router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/status', auth, updateOrderStatus);
router.post('/:id/cancel', auth, cancelOrder);

export const orderRoutes = router;