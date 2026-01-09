import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { StoreService } from '../services/store.service';

const router = Router();

// Dependency Injection: Create instances
const storeService = new StoreService();
const storeController = new StoreController(storeService);

// Routes
router.get('/', (req, res, next) => storeController.getStores(req, res, next));
router.get('/:slug', (req, res, next) => storeController.getStoreBySlug(req, res, next));
router.get('/:slug/products', (req, res, next) => storeController.getStoreProducts(req, res, next));
router.get('/:slug/services', (req, res, next) => storeController.getStoreServices(req, res, next));

export default router;

