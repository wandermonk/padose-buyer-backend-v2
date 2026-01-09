import { CategoryDto } from './store.dto';

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  category?: CategoryDto;
}

export interface ProductVariationDto {
  id: string;
  type: string;
  name: string;
  value?: string;
  priceModifier: number;
  stock: number;
}

export interface ProductDetailDto extends ProductDto {
  variations: ProductVariationDto[];
}

export interface ProductListResponse {
  products: ProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

