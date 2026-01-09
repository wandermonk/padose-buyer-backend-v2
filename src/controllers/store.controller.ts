// Controller: Handles HTTP requests and responses
// Follows Single Responsibility Principle

import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/store.service';
import { sendSuccess } from '../utils/response';
import { parsePaginationParams } from '../utils/pagination';

export class StoreController {
  constructor(private storeService: StoreService) {}

  async getStores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = parsePaginationParams(req.query);
      const search = req.query.search as string | undefined;

      const result = await this.storeService.getStores(params, search);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStoreBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const store = await this.storeService.getStoreBySlug(slug);
      sendSuccess(res, store);
    } catch (error) {
      next(error);
    }
  }

  async getStoreProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const params = parsePaginationParams(req.query);
      const categorySlug = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.storeService.getStoreProducts(slug, params, categorySlug, search);
      
      // Map products using product mapper
      const { mapProductToDto } = await import('../mappers/product.mapper');
      sendSuccess(res, {
        products: result.data.map(mapProductToDto),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoreServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const params = parsePaginationParams(req.query);
      const categorySlug = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.storeService.getStoreServices(slug, params, categorySlug, search);
      
      // Map services using service mapper
      const { mapServiceToDto } = await import('../mappers/service.mapper');
      sendSuccess(res, {
        services: result.data.map(mapServiceToDto),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

