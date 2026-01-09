import { ServiceDataAccess } from '../models/service.dao';
import { mapServiceToDto, mapServiceToDetailDto } from '../mappers/service.mapper';
import { ServiceListResponse, ServiceDetailDto } from '../dtos/service.dto';
import { AppError } from '../middleware/errorHandler';
import { PaginationParams } from '../types/common';

export class ServiceService {
  private serviceDAO = new ServiceDataAccess();

  async getServices(
    params: PaginationParams,
    filters: {
      storeSlug?: string;
      categorySlug?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    sortBy?: string
  ): Promise<ServiceListResponse> {
    const result = await this.serviceDAO.findAll(
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
      services: result.data.map(mapServiceToDto),
      pagination: result.pagination,
    };
  }

  async getServiceBySlug(slug: string, storeSlug?: string): Promise<ServiceDetailDto> {
    const service = await this.serviceDAO.findBySlug(slug, storeSlug);

    if (!service) {
      throw new AppError('NOT_FOUND', `Service with slug "${slug}" not found`, 404);
    }

    return mapServiceToDetailDto(service);
  }
}

