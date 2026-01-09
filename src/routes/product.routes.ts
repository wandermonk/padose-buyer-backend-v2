import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';

const router = Router();

const productService = new ProductService();
const productController = new ProductController(productService);

router.get('/', (req, res, next) => productController.getProducts(req, res, next));
router.get('/:slug', (req, res, next) => productController.getProductBySlug(req, res, next));

export default router;

