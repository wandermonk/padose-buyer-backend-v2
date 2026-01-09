import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response';
import { parsePaginationParams } from '../utils/pagination';

export class ProductController {
  constructor(private productService: ProductService) {}

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await this.productService.getProducts(params, filters, sortBy);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const storeSlug = req.query.store as string | undefined;

      const product = await this.productService.getProductBySlug(slug, storeSlug);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
}

