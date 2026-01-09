import { ProductCategoryDto, ServiceCategoryDto, CategoryDetailDto } from '../dtos/category.dto';
import { Prisma } from '@prisma/client';

type DatabaseCategoryRef = Prisma.CategoryRefGetPayload<{
  include: {
    _count: {
      select: {
        categories: true;
      };
    };
  };
}>;

/**
 * Maps category_ref to ProductCategoryDto or ServiceCategoryDto
 */
export function mapCategoryRefToDto(
  categoryRef: DatabaseCategoryRef,
  type: 'product' | 'service'
): ProductCategoryDto | ServiceCategoryDto {
  const base = {
    id: String(categoryRef.categoryRefId),
    name: categoryRef.categoryName || '',
    slug: generateSlug(categoryRef.categoryName || '', categoryRef.categoryRefId),
    description: undefined, // Not in category_ref
    image: categoryRef.image || undefined,
  };

  if (type === 'product') {
    return {
      ...base,
      productCount: 0, // Will be calculated from products
    } as ProductCategoryDto;
  } else {
    return {
      ...base,
      serviceCount: 0, // Will be calculated from services
    } as ServiceCategoryDto;
  }
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

