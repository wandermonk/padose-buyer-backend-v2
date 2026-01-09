import { ProductDataAccess } from '../models/product.dao';
import { mapProductToDto, mapProductToDetailDto } from '../mappers/product.mapper';
import { ProductListResponse, ProductDetailDto } from '../dtos/product.dto';
import { AppError } from '../middleware/errorHandler';
import { PaginationParams } from '../types/common';

export class ProductService {
  private productDAO = new ProductDataAccess();

  async getProducts(
    params: PaginationParams,
    filters: {
      storeSlug?: string;
      categorySlug?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    sortBy?: string
  ): Promise<ProductListResponse> {
    const result = await this.productDAO.findAll(
      {
        storeSlug: filters.storeSlug,
        categorySlug: filters.categorySlug,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isActive: true,
      },
      {
        page: params.page,
        limit: params.limit,
        sortBy: sortBy as any,
      }
    );

    return {
      products: result.data.map(mapProductToDto),
      pagination: result.pagination,
    };
  }

  async getProductBySlug(slug: string, storeSlug?: string): Promise<ProductDetailDto> {
    const product = await this.productDAO.findBySlug(slug, storeSlug);

    if (!product) {
      throw new AppError('NOT_FOUND', `Product with slug "${slug}" not found`, 404);
    }

    return mapProductToDetailDto(product);
  }
}

