import { ProductDataAccess } from '../models/product.dao';
import { ServiceDataAccess } from '../models/service.dao';
import { StoreDataAccess } from '../models/store.dao';
import { mapProductToDto } from '../mappers/product.mapper';
import { mapServiceToDto } from '../mappers/service.mapper';
import { mapStoreToDto } from '../mappers/store.mapper';
import { SearchResponse, SearchType } from '../dtos/search.dto';
import { PaginationParams } from '../types/common';

export class SearchService {
  private productDAO = new ProductDataAccess();
  private serviceDAO = new ServiceDataAccess();
  private storeDAO = new StoreDataAccess();

  async search(
    query: string,
    type: SearchType,
    params: PaginationParams
  ): Promise<SearchResponse> {
    const searchPromises: Promise<unknown>[] = [];
    const limit = Math.min(params.limit, 20); // Limit per type for search

    if (type === 'all' || type === 'products') {
      searchPromises.push(
        this.productDAO.findAll(
          { search: query, isActive: true },
          { page: 1, limit }
        )
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }));
    }

    if (type === 'all' || type === 'services') {
      searchPromises.push(
        this.serviceDAO.findAll(
          { search: query, isActive: true },
          { page: 1, limit }
        )
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }));
    }

    if (type === 'all' || type === 'stores') {
      searchPromises.push(
        this.storeDAO.findAll(
          { search: query, isActive: true, isVerified: true },
          { page: 1, limit }
        )
      );
    } else {
      searchPromises.push(Promise.resolve({ data: [], pagination: { total: 0 } }));
    }

    const [productsResult, servicesResult, storesResult] = await Promise.all(searchPromises);

    const products = (productsResult as { data: unknown[]; pagination: { total: number } }).data;
    const services = (servicesResult as { data: unknown[]; pagination: { total: number } }).data;
    const stores = (storesResult as { data: unknown[]; pagination: { total: number } }).data;

    const productCount = (productsResult as { pagination: { total: number } }).pagination.total;
    const serviceCount = (servicesResult as { pagination: { total: number } }).pagination.total;
    const storeCount = (storesResult as { pagination: { total: number } }).pagination.total;

    return {
      query,
      results: {
        products: (products as any[]).map(mapProductToDto),
        services: (services as any[]).map(mapServiceToDto),
        stores: (stores as any[]).map(mapStoreToDto),
      },
      counts: {
        products: productCount,
        services: serviceCount,
        stores: storeCount,
        total: productCount + serviceCount + storeCount,
      },
      pagination: {
        page: params.page,
        limit: params.limit,
        total: productCount + serviceCount + storeCount,
        totalPages: Math.ceil((productCount + serviceCount + storeCount) / params.limit),
      },
    };
  }
}
