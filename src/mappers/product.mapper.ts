import { ProductDto, ProductDetailDto, ProductVariationDto } from '../dtos/product.dto';
import { ProductMapping, ProductVariationMapping } from '../config/fieldMapping';
import { ProductDAO } from '../models/product.dao';

/**
 * Maps DAO product to ProductDto
 */
export function mapProductToDto(product: ProductDAO): ProductDto {
  // Get images from entity_images table
  const images = (product.images || [])
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(img => img.imageUrl || '')
    .filter(Boolean);
  
  // Use product image as fallback
  if (product.image && !images.includes(product.image)) {
    images.unshift(product.image);
  }
  
  // Calculate discount from cutPrice or variations
  let originalPrice: number | undefined;
  let discount: number | undefined;
  
  if (product.variations && product.variations.length > 0) {
    const prices = product.variations
      .map(v => v.cutPrice || v.displayPrice)
      .filter((p): p is number => p !== null && p !== undefined);
    
    if (prices.length > 0) {
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      originalPrice = maxPrice;
      if (maxPrice > minPrice) {
        discount = Math.round(((maxPrice - minPrice) / maxPrice) * 100);
      }
    }
  }
  
  // If no variations, use basePrice
  const price = product.basePrice || 0;
  
  return {
    id: String(product.productId),
    name: product.productName,
    slug: product.productSlug || generateSlug(product.productName, product.productId),
    description: product.description || undefined,
    images: images.length > 0 ? images : [product.image || ''],
    price,
    originalPrice,
    discount,
    stock: 0, // Not in product table - would need inventory table
    store: product.category?.business ? {
      id: String(product.category.business.businessId),
      name: product.category.business.businessName,
      slug: product.category.business.businessSlug || generateSlug(product.category.business.businessName, product.category.business.businessId),
      logo: product.category.business.logoImage || undefined,
    } : {
      id: '',
      name: '',
      slug: '',
    },
    category: product.category?.categoryRef ? {
      id: String(product.category.categoryRef.categoryRefId),
      name: product.category.categoryRef.categoryName || '',
      slug: generateSlug(product.category.categoryRef.categoryName || '', product.category.categoryRef.categoryRefId),
    } : undefined,
  };
}

/**
 * Maps DAO product to detailed ProductDetailDto with variations
 */
export function mapProductToDetailDto(product: ProductDAO): ProductDetailDto {
  const baseDto = mapProductToDto(product);
  
  return {
    ...baseDto,
    variations: mapProductVariations(product.variations || []),
  };
}

/**
 * Maps product variations from DAO
 */
function mapProductVariations(
  variations: ProductDAO['variations'] = []
): ProductVariationDto[] {
  if (!variations) return [];
  
  return variations.map(v => {
    // Calculate price modifier (difference from base price)
    const priceModifier = v.displayPrice ? (v.cutPrice || v.displayPrice) - (v.displayPrice || 0) : 0;
    
    return {
      id: String(v.variationId),
      type: v.variantType || 'default',
      name: v.displayText,
      value: v.variantValue || undefined,
      priceModifier,
      stock: 0, // Not in variation table
    };
  });
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
 */
export function mapProductFromCustomStructure(customProduct: unknown): ProductDto {
  const product = customProduct as Record<string, unknown>;
  
  return {
    id: String(product.product_id || product.id || ''),
    name: String(product.product_name || product.name || ''),
    slug: String(product.product_slug || product.slug || ''),
    description: product.description ? String(product.description) : undefined,
    images: Array.isArray(product.images) 
      ? product.images.map(String) 
      : product.image 
        ? [String(product.image)] 
        : [],
    price: Number(product.base_price || product.price || 0),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    discount: product.discount ? Number(product.discount) : undefined,
    stock: Number(product.stock || 0),
    store: {
      id: String(product.business_id || ''),
      name: String(product.business_name || ''),
      slug: String(product.business_slug || ''),
      logo: product.logo_image ? String(product.logo_image) : undefined,
    },
    category: product.category_id ? {
      id: String(product.category_id || ''),
      name: String(product.category_name || ''),
      slug: String(product.category_slug || ''),
    } : undefined,
  };
}
