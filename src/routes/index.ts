import { Router } from 'express';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import serviceRoutes from './service.routes';
import categoryRoutes from './category.routes';
import searchRoutes from './search.routes';

const router = Router();

// API Routes
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);
router.use('/search', searchRoutes);

export default router;

