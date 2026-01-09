import { getPrismaClient } from '../config/database';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// Use Prisma-generated types
export type ProductDAO = Prisma.ProductGetPayload<{
  include: {
    category: {
      include: {
        categoryRef: true;
        business: {
          select: {
            businessId: true;
            businessName: true;
            businessSlug: true;
            logoImage: true;
          };
        };
      };
    };
    variations: true;
    images: {
      orderBy: { displayOrder: 'asc' };
    };
  };
}>;

export interface ProductRepositoryFilters {
  storeSlug?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  businessId?: bigint;
}

export interface ProductRepositoryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

/**
 * Product Data Access - Uses Prisma Client to connect to Supabase PostgreSQL
 */
export class ProductDataAccess {
  async findAll(
    filters: ProductRepositoryFilters = {},
    options: ProductRepositoryOptions = {}
  ): Promise<{ data: ProductDAO[]; pagination: any }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build category filter if categorySlug provided
    let categoryFilter: Prisma.CategoryWhereInput | undefined;
    if (filters.categorySlug) {
      categoryFilter = {
        categoryRef: {
          categoryName: {
            contains: filters.categorySlug.replace(/-/g, ' '),
            mode: 'insensitive',
          },
          isActive: true,
        },
      };
    }

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      isApproved: true,
      entityType: 'product',
      ...(filters.businessId && {
        category: {
          businessId: filters.businessId,
        },
      }),
      ...(filters.storeSlug && {
        category: {
          business: {
            businessSlug: filters.storeSlug,
            isActive: true,
          },
        },
      }),
      ...(categoryFilter && {
        category: categoryFilter,
      }),
      ...(filters.search && {
        OR: [
          { productName: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { keywords: { has: filters.search } },
        ],
      }),
      ...(filters.minPrice !== undefined && {
        basePrice: { gte: filters.minPrice },
      }),
      ...(filters.maxPrice !== undefined && {
        basePrice: { lte: filters.maxPrice },
      }),
    };

    const orderBy = this.getOrderBy(options.sortBy);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            include: {
              categoryRef: true,
              business: {
                select: {
                  businessId: true,
                  businessName: true,
                  businessSlug: true,
                  logoImage: true,
                },
              },
            },
          },
          variations: {
            where: { displayPrice: { not: null } },
            orderBy: [{ variantType: 'asc' }, { displayText: 'asc' }],
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, storeSlug?: string): Promise<ProductDAO | null> {
    const where: Prisma.ProductWhereInput = {
      productSlug: slug,
      isDeleted: false,
      isActive: true,
      isApproved: true,
      entityType: 'product',
      ...(storeSlug && {
        category: {
          business: {
            businessSlug: storeSlug,
            isActive: true,
          },
        },
      }),
    };

    const product = await prisma.product.findFirst({
      where,
      include: {
        category: {
          include: {
            categoryRef: true,
            business: {
              select: {
                businessId: true,
                businessName: true,
                businessSlug: true,
                logoImage: true,
              },
            },
          },
        },
        variations: {
          where: { displayPrice: { not: null } },
          orderBy: [{ variantType: 'asc' }, { displayText: 'asc' }],
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return product;
  }

  private getOrderBy(sortBy?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { basePrice: 'asc' };
      case 'price_desc':
        return { basePrice: 'desc' };
      case 'rating':
        return { category: { business: { rating: 'desc' } } };
      case 'newest':
      default:
        return { createdOn: 'desc' };
    }
  }
}
