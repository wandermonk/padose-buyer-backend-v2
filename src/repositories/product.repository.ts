import { getPrismaClient } from '../config/database';
import { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

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
  include?: Prisma.ProductInclude;
}

export class ProductRepository {
  async findAll(
    filters: ProductRepositoryFilters = {},
    options: ProductRepositoryOptions = {}
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build category filter if categorySlug provided
    let categoryFilter: Prisma.CategoryWhereInput | undefined;
    if (filters.categorySlug) {
      // Need to find category_ref by slug (generated from name)
      // For now, we'll filter by category_ref name containing the slug
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
      entityType: 'product', // Only products, not services
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
        include: options.include || {
          category: {
            include: {
              categoryRef: {
                select: {
                  categoryRefId: true,
                  categoryName: true,
                },
              },
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

    // Business is already included via category.business in the query above
    const productsWithBusiness = products;

    return {
      data: productsWithBusiness,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, storeSlug?: string) {
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
            categoryRef: {
              select: {
                categoryRefId: true,
                categoryName: true,
              },
            },
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

    if (!product) return null;

    // Attach business info
    const business = product.category?.business;
    return {
      ...product,
      business: business || null,
    };
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

