// Service Layer: Contains business logic
// Updated to work with Business table using Supabase DAOs

import { StoreDataAccess } from '../models/store.dao';
import { ProductDataAccess } from '../models/product.dao';
import { ServiceDataAccess } from '../models/service.dao';
import { mapStoreToDto, mapStoreToDetailDto } from '../mappers/store.mapper';
import { StoreListResponse, StoreDetailResponse } from '../dtos/store.dto';
import { AppError } from '../middleware/errorHandler';
import { PaginationParams } from '../types/common';

export class StoreService {
  private storeDAO = new StoreDataAccess();
  private productDAO = new ProductDataAccess();
  private serviceDAO = new ServiceDataAccess();

  async getStores(
    params: PaginationParams,
    search?: string
  ): Promise<StoreListResponse> {
    const result = await this.storeDAO.findAll(
      { search, isActive: true, isVerified: true },
      { page: params.page, limit: params.limit }
    );

    return {
      stores: result.data.map(mapStoreToDto),
      pagination: result.pagination,
    };
  }

  async getStoreBySlug(slug: string): Promise<StoreDetailResponse> {
    const business = await this.storeDAO.findBySlug(slug);

    if (!business) {
      throw new AppError('NOT_FOUND', `Store with slug "${slug}" not found`, 404);
    }

    return mapStoreToDetailDto(business);
  }

  async getStoreProducts(
    slug: string,
    params: PaginationParams,
    categorySlug?: string,
    search?: string
  ) {
    const business = await this.storeDAO.findBySlug(slug);

    if (!business) {
      throw new AppError('NOT_FOUND', `Store with slug "${slug}" not found`, 404);
    }

    return this.productDAO.findAll(
      {
        businessId: business.businessId,
        categorySlug,
        search,
        isActive: true,
      },
      {
        page: params.page,
        limit: params.limit,
      }
    );
  }

  async getStoreServices(
    slug: string,
    params: PaginationParams,
    categorySlug?: string,
    search?: string
  ) {
    const business = await this.storeDAO.findBySlug(slug);

    if (!business) {
      throw new AppError('NOT_FOUND', `Store with slug "${slug}" not found`, 404);
    }

    return this.serviceDAO.findAll(
      {
        businessId: business.businessId,
        categorySlug,
        search,
        isActive: true,
      },
      {
        page: params.page,
        limit: params.limit,
      }
    );
  }
}
