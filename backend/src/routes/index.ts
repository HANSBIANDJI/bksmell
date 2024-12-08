import { Router } from 'express';
import { orderRoutes } from './order.routes';
import { perfumeRoutes } from './perfume.routes';
import { paymentRoutes } from './payment.routes';
import { healthRoutes } from './health.routes';

const router = Router();

router.use('/orders', orderRoutes);
router.use('/perfumes', perfumeRoutes);
router.use('/payments', paymentRoutes);
router.use('/health', healthRoutes);

export const routes = router;