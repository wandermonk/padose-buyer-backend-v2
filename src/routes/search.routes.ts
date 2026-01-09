import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { SearchService } from '../services/search.service';

const router = Router();

const searchService = new SearchService();
const searchController = new SearchController(searchService);

router.get('/', (req, res, next) => searchController.search(req, res, next));

export default router;

