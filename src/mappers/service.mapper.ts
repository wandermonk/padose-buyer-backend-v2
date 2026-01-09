import { ServiceDto, ServiceDetailDto, ServicePackageDto, ServiceVariationDto } from '../dtos/service.dto';
import { ServiceMapping, ServiceVariationMapping } from '../config/fieldMapping';
import { ServiceDAO } from '../models/service.dao';

/**
 * Maps DAO service to ServiceDto
 */
export function mapServiceToDto(service: ServiceDAO): ServiceDto {
  // Get images from entity_images table or entityImages JSON
  let images: string[] = [];
  
  // Try entity_images table first
  if (service.images && service.images.length > 0) {
    images = service.images
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(img => img.imageUrl || '')
      .filter(Boolean);
  }
  
  // Fallback to entityImages JSON field
  if (images.length === 0 && service.entityImages) {
    try {
      const entityImages = service.entityImages as unknown;
      if (Array.isArray(entityImages)) {
        images = entityImages.map((img: any) => 
          typeof img === 'string' ? img : img?.url || img?.imageUrl || ''
        ).filter(Boolean);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // Use service image as fallback
  if (service.image && !images.includes(service.image)) {
    images.unshift(service.image);
  }
  
  // Rating and ratingCount not in services table - default to 0
  // TODO: Add reviews table if available
  
  return {
    id: String(service.serviceId),
    name: service.serviceName,
    slug: service.serviceSlug || generateSlug(service.serviceName, service.serviceId),
    description: service.description || undefined,
    images: images.length > 0 ? images : [service.image || ''],
    basePrice: Number(service.basePrice),
    rating: 0, // Not in services table
    ratingCount: 0, // Not in services table
    store: service.business ? {
      id: String(service.business.businessId),
      name: service.business.businessName,
      slug: service.business.businessSlug || generateSlug(service.business.businessName, service.business.businessId),
      logo: service.business.logoImage || undefined,
    } : {
      id: '',
      name: '',
      slug: '',
    },
    category: undefined, // Category relation not included - add if needed
  };
}

/**
 * Maps DAO service to detailed ServiceDetailDto
 */
export function mapServiceToDetailDto(service: ServiceDAO): ServiceDetailDto {
  const baseDto = mapServiceToDto(service);
  
  // Map packages from priceVariations JSON or variations
  const packages: ServicePackageDto[] = [];
  
  // Try priceVariations JSON first
  if (service.priceVariations) {
    try {
      const priceVars = service.priceVariations as unknown;
      if (Array.isArray(priceVars)) {
        priceVars.forEach((pkg: any) => {
          packages.push({
            id: String(pkg.id || pkg.packageId || ''),
            name: pkg.name || pkg.packageName || 'Package',
            price: Number(pkg.price || pkg.basePrice || 0),
            description: pkg.description || undefined,
          });
        });
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // If no packages from JSON, create from variations
  if (packages.length === 0 && service.variations && service.variations.length > 0) {
    service.variations.forEach((variation, index) => {
      packages.push({
        id: String(variation.variationId),
        name: variation.displayText || `Package ${index + 1}`,
        price: Number(variation.displayPrice),
        description: variation.description || undefined,
      });
    });
  }
  
  // If still no packages, create default from basePrice
  if (packages.length === 0) {
    packages.push({
      id: 'default',
      name: 'Standard',
      price: Number(service.basePrice),
      description: undefined,
    });
  }
  
  return {
    ...baseDto,
    packages,
    variations: mapServiceVariations(service.variations || []),
  };
}

/**
 * Maps service variations
 */
function mapServiceVariations(
  variations: ServiceDAO['variations'] = []
): ServiceVariationDto[] {
  if (!variations) return [];
  
  return variations.map(v => {
    const priceModifier = v.cutPrice ? Number(v.cutPrice) - Number(v.displayPrice) : 0;
    
    return {
      id: String(v.variationId),
      type: 'duration',
      name: v.displayText || v.duration || 'Standard',
      value: v.duration || undefined,
      priceModifier,
    };
  });
}

/**
 * Generate slug from name and id
 */
function generateSlug(name: string, id: number | bigint): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${id}`;
}

/**
 * Custom mapper for different database structures
 */
export function mapServiceFromCustomStructure(customService: unknown): ServiceDto {
  const service = customService as Record<string, unknown>;
  
  return {
    id: String(service.service_id || service.id || ''),
    name: String(service.service_name || service.name || ''),
    slug: String(service.service_slug || service.slug || ''),
    description: service.description ? String(service.description) : undefined,
    images: Array.isArray(service.images) 
      ? service.images.map(String) 
      : service.image 
        ? [String(service.image)] 
        : [],
    basePrice: Number(service.base_price || service.price || 0),
    rating: Number(service.rating || 0),
    ratingCount: Number(service.rating_count || 0),
    store: {
      id: String(service.business_id || ''),
      name: String(service.business_name || ''),
      slug: String(service.business_slug || ''),
      logo: service.logo_image ? String(service.logo_image) : undefined,
    },
    category: service.category_id ? {
      id: String(service.category_id || ''),
      name: String(service.category_name || ''),
      slug: String(service.category_slug || ''),
    } : undefined,
  };
}
