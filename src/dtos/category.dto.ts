export interface ProductCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface ServiceCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  serviceCount?: number;
}

export interface CategoryDetailDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  serviceCount: number;
  storeCount: number;
}

