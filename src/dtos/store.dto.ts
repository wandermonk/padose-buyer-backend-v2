// DTOs (Data Transfer Objects) define the API response structure
// These are what the frontend expects, regardless of database structure

export interface StoreDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating: number;
  ratingCount: number;
  productCount?: number;
  serviceCount?: number;
  categories?: CategoryDto[];
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface StoreListResponse {
  stores: StoreDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreDetailResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating: number;
  ratingCount: number;
  productCount: number;
  serviceCount: number;
  categories: CategoryDto[];
}

