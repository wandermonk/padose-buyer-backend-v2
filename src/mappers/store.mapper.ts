// Mappers transform Prisma-generated DAOs to DTOs
// Uses configurable field mapping

import { StoreDto, StoreDetailResponse, CategoryDto } from '../dtos/store.dto';
import { BusinessToStoreMapping, mapObject } from '../config/fieldMapping';
import { BusinessDAO } from '../models/store.dao';

/**
 * Maps Prisma-generated Business DAO to StoreDto
 */
export function mapStoreToDto(business: BusinessDAO): StoreDto {
  // Get base mapped fields
  const base = mapObject(business, BusinessToStoreMapping);
  
  // Calculate service count
  // Note: Products are accessed through categories, so we can't count them directly here
  const productCount = 0; // Would need separate query to count products
  const serviceCount = business.services?.length || 0;
  
  // Rating count is not stored, default to 0 or calculate from reviews if available
  const ratingCount = 0; // TODO: Add reviews table if available
  
  return {
    id: String(business.businessId),
    name: business.businessName,
    slug: business.businessSlug || generateSlug(business.businessName, business.businessId),
    description: business.description || undefined,
    logo: business.logoImage || undefined,
    banner: undefined, // Not in business table
    rating: business.rating || 0,
    ratingCount,
    productCount,
    serviceCount,
  };
}

/**
 * Maps Prisma-generated Business DAO to detailed response
 */
export function mapStoreToDetailDto(business: BusinessDAO): StoreDetailResponse {
  const baseDto = mapStoreToDto(business);
  
  // Map categories
  const categories: CategoryDto[] = (business.categories || [])
    .filter(cat => cat.isActive && cat.categoryRef?.isActive)
    .map(cat => ({
      id: String(cat.categoryRef?.categoryRefId || cat.categoryRefId),
      name: cat.categoryRef?.categoryName || '',
      slug: generateSlug(cat.categoryRef?.categoryName || '', cat.categoryRef?.categoryRefId || cat.categoryRefId),
    }));
  
  return {
    ...baseDto,
    productCount: baseDto.productCount || 0, // Ensure it's a number for StoreDetailResponse
    serviceCount: baseDto.serviceCount || 0,
    categories,
  };
}

/**
 * Generate slug from name and id
 */
function generateSlug(name: string, id: bigint | number): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${id}`;
}

/**
 * Custom mapper for different database structures
 * Use this if your database structure is significantly different
 */
export function mapStoreFromCustomStructure(customStore: unknown): StoreDto {
  const store = customStore as Record<string, unknown>;
  
  return {
    id: String(store.business_id || store.id || ''),
    name: String(store.business_name || store.name || ''),
    slug: String(store.business_slug || store.slug || generateSlug(String(store.business_name || ''), Number(store.business_id || 0))),
    description: store.description ? String(store.description) : undefined,
    logo: store.logo_image ? String(store.logo_image) : undefined,
    banner: store.banner_image ? String(store.banner_image) : undefined,
    rating: Number(store.rating || 0),
    ratingCount: Number(store.rating_count || store.review_count || 0),
    productCount: Number(store.product_count || 0),
    serviceCount: Number(store.service_count || 0),
  };
}
