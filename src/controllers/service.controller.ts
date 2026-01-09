import { Request, Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';
import { sendSuccess } from '../utils/response';
import { parsePaginationParams } from '../utils/pagination';

export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parsePaginationParams(req.query);
      const filters = {
        storeSlug: req.query.store as string | undefined,
        categorySlug: req.query.category as string | undefined,
        search: req.query.search as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };
      const sortBy = req.query.sortBy as string | undefined;

      const result = await this.serviceService.getServices(params, filters, sortBy);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const storeSlug = req.query.store as string | undefined;

      const service = await this.serviceService.getServiceBySlug(slug, storeSlug);
      sendSuccess(res, service);
    } catch (error) {
      next(error);
    }
  }
}

