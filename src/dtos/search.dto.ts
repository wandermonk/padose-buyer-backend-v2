import { ProductDto } from './product.dto';
import { ServiceDto } from './service.dto';
import { StoreDto } from './store.dto';

export interface SearchResponse {
  query: string;
  results: {
    products: ProductDto[];
    services: ServiceDto[];
    stores: StoreDto[];
  };
  counts: {
    products: number;
    services: number;
    stores: number;
    total: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type SearchType = 'products' | 'services' | 'stores' | 'all';

