import { CategoryDto } from './store.dto';

export interface ServiceDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  basePrice: number;
  rating: number;
  ratingCount: number;
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  category?: CategoryDto;
}

export interface ServicePackageDto {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface ServiceVariationDto {
  id: string;
  type: string;
  name: string;
  value?: string;
  priceModifier: number;
}

export interface ServiceDetailDto extends ServiceDto {
  packages: ServicePackageDto[];
  variations: ServiceVariationDto[];
}

export interface ServiceListResponse {
  services: ServiceDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

