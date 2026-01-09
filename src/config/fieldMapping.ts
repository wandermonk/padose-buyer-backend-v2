/**
 * Field Mapping Configuration
 * 
 * This file maps database field names to API DTO field names.
 * Update this file if your database structure changes.
 */

export const BusinessToStoreMapping = {
  // Primary fields
  id: 'businessId',
  name: 'businessName',
  slug: 'businessSlug',
  description: 'description',
  logo: 'logoImage',
  banner: null, // Not in business table - can be derived or null
  rating: 'rating',
  ratingCount: null, // Not directly stored - needs calculation
  
  // Additional business fields that can be used
  address: 'address',
  city: 'city',
  state: 'state',
  country: 'country',
  pincode: 'pincode',
  contactNumber: 'contactNumber',
  emailAddress: 'emailAddress',
  isVerified: 'isVerified',
  isActive: 'isActive',
  latitude: 'latitude',
  longitude: 'longitude',
  district: 'district',
  storeStatus: 'storeStatus',
  acceptingOrders: 'acceptingOrders',
  holidayMode: 'holidayMode',
} as const;

export const ProductMapping = {
  id: 'productId',
  name: 'productName',
  slug: 'productSlug',
  description: 'description',
  price: 'basePrice',
  originalPrice: null, // Can be derived from cutPrice or variations
  discount: null, // Calculated field
  stock: null, // Not in product table - might need separate inventory table
  images: null, // Comes from entity_images table
  entityType: 'entityType',
  isActive: 'isActive',
  isApproved: 'isApproved',
  isDeleted: 'isDeleted',
  hasVariation: 'hasVariation',
  brand: 'brand',
  condition: 'condition',
  keywords: 'keywords',
} as const;

export const ServiceMapping = {
  id: 'serviceId',
  name: 'serviceName',
  slug: 'serviceSlug',
  description: 'description',
  basePrice: 'basePrice',
  cutPrice: 'cutPrice',
  rating: null, // Not in services table - might need reviews table
  ratingCount: null, // Not in services table
  images: null, // Comes from entity_images or entityImages JSON
  isActive: 'isActive',
  isApproved: 'isApproved',
  isDeleted: 'isDeleted',
  hasVariation: 'hasVariation',
  serviceLocation: 'serviceLocation',
  serviceDuration: 'serviceDuration',
  pricingType: 'pricingType',
  priceVariations: 'priceVariations',
} as const;

export const CategoryMapping = {
  id: 'categoryRefId',
  name: 'categoryName',
  slug: null, // Not in category_ref - might need to generate from name
  description: null, // Not in category_ref
  image: 'image',
  isActive: 'isActive',
  categoryType: 'categoryType',
  subCategoryName: 'subCategoryName',
} as const;

export const ProductVariationMapping = {
  id: 'variationId',
  type: 'variantType',
  name: 'displayText',
  value: 'variantValue',
  priceModifier: null, // Can be calculated from displayPrice - basePrice
  stock: null, // Not in variation table
  displayPrice: 'displayPrice',
  cutPrice: 'cutPrice',
  displayImage: 'displayImage',
  variantMetadata: 'variantMetadata',
} as const;

export const ServiceVariationMapping = {
  id: 'variationId',
  type: 'duration', // Default type for service variations
  name: 'displayText',
  value: 'duration',
  priceModifier: null, // Can be calculated from displayPrice - basePrice
  displayPrice: 'displayPrice',
  cutPrice: 'cutPrice',
  duration: 'duration',
  unit: 'unit',
  quantity: 'quantity',
  description: 'description',
} as const;

/**
 * Helper function to get mapped field value
 */
export function getMappedField<T extends Record<string, any>>(
  source: T,
  mapping: Record<string, string | null>,
  field: string
): unknown {
  const mappedField = mapping[field];
  if (!mappedField) {
    return undefined;
  }
  return source[mappedField as keyof T];
}

/**
 * Helper function to map entire object
 */
export function mapObject<T extends Record<string, any>>(
  source: T,
  mapping: Record<string, string | null>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [dtoField, dbField] of Object.entries(mapping)) {
    if (dbField && source[dbField as keyof T] !== undefined) {
      result[dtoField] = source[dbField as keyof T];
    }
  }
  
  return result;
}

