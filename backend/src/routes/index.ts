import { Router } from 'express';
import { orderRoutes } from './order.routes';
import { perfumeRoutes } from './perfume.routes';
import { paymentRoutes } from './payment.routes';

const router = Router();

router.use('/orders', orderRoutes);
router.use('/perfumes', perfumeRoutes);
router.use('/payments', paymentRoutes);

// Health check route
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

export const routes = router;