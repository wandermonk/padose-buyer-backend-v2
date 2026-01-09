import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { sendSuccess } from '../utils/response';
import { parsePaginationParams } from '../utils/pagination';
import { SearchType } from '../dtos/search.dto';

export class SearchController {
  constructor(private searchService: SearchService) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const type = (req.query.type as SearchType) || 'all';
      const params = parsePaginationParams(req.query);

      if (!query || query.trim().length === 0) {
        return sendSuccess(res, {
          query: '',
          results: {
            products: [],
            services: [],
            stores: [],
          },
          counts: {
            products: 0,
            services: 0,
            stores: 0,
            total: 0,
          },
          pagination: {
            page: params.page,
            limit: params.limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const result = await this.searchService.search(query.trim(), type, params);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

