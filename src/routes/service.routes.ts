import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { ServiceService } from '../services/service.service';

const router = Router();

const serviceService = new ServiceService();
const serviceController = new ServiceController(serviceService);

router.get('/', (req, res, next) => serviceController.getServices(req, res, next));
router.get('/:slug', (req, res, next) => serviceController.getServiceBySlug(req, res, next));

export default router;

