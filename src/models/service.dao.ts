import { getPrismaClient } from '../config/database';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// Use Prisma-generated types
export type ServiceDAO = Prisma.ServiceGetPayload<{
  include: {
    business: {
      select: {
        businessId: true;
        businessName: true;
        businessSlug: true;
        logoImage: true;
      };
    };
    variations: {
      orderBy: [{ duration: 'asc' }, { displayText: 'asc' }];
    };
    images: {
      orderBy: { displayOrder: 'asc' };
    };
  };
}> & {
  // Category info fetched separately (Service doesn't have direct category relation in Prisma)
  category?: {
    categoryId: bigint;
    categoryRefId: bigint;
    categoryRef: {
      categoryRefId: bigint;
      categoryName: string | null;
      subCategoryName: string | null;
      image: string | null;
    } | null;
  } | null;
};

export interface ServiceRepositoryFilters {
  storeSlug?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  businessId?: bigint;
}

export interface ServiceRepositoryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

/**
 * Service Data Access - Uses Prisma Client to connect to Supabase PostgreSQL
 */
export class ServiceDataAccess {
  async findAll(
    filters: ServiceRepositoryFilters = {},
    options: ServiceRepositoryOptions = {}
  ): Promise<{ data: ServiceDAO[]; pagination: any }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 500);
    const skip = (page - 1) * limit;

    // Build category filter if categorySlug provided
    // Service model doesn't have a direct category relation, so we need to find category IDs first
    let categoryIds: number[] | undefined;
    if (filters.categorySlug) {
      const categoryName = filters.categorySlug.replace(/-/g, ' ');
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          categoryRef: {
            OR: [
              { subCategoryName: { contains: categoryName, mode: 'insensitive' } },
              { categoryName: { contains: categoryName, mode: 'insensitive' } },
            ],
            isActive: true,
            categoryType: 'service',
          },
        },
        select: {
          categoryId: true,
        },
      });
      categoryIds = categories.map(c => Number(c.categoryId));
      
      // If no categories found, return empty result
      if (categoryIds.length === 0) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    const where: Prisma.ServiceWhereInput = {
      isDeleted: false,
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      isApproved: true,
      ...(filters.businessId && {
        businessId: filters.businessId,
      }),
      ...(filters.storeSlug && {
        business: {
          businessSlug: filters.storeSlug,
          isActive: true,
        },
      }),
      ...(categoryIds && categoryIds.length > 0 && {
        categoryId: { in: categoryIds },
      }),
      ...(filters.search && {
        OR: [
          { serviceName: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
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

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: {
            select: {
              businessId: true,
              businessName: true,
              businessSlug: true,
              logoImage: true,
            },
          },
          variations: {
            orderBy: [{ duration: 'asc' }, { displayText: 'asc' }],
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy,
      }),
      prisma.service.count({ where }),
    ]);

    // Fetch category information for services (similar to products)
    const serviceCategoryIds = [
      ...new Set(
        services
          .map((s) => s.categoryId)
          .filter((id): id is number => id !== null && id !== undefined)
      ),
    ];

    const categoryMap = new Map<
      number,
      {
        categoryId: bigint;
        categoryRefId: bigint;
        categoryRef: {
          categoryRefId: bigint;
          categoryName: string | null;
          subCategoryName: string | null;
          image: string | null;
        } | null;
      }
    >();

    if (serviceCategoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: {
          categoryId: { in: serviceCategoryIds.map((id) => BigInt(id)) },
          isActive: true,
        },
        include: {
          categoryRef: true,
        },
      });

      categories.forEach((cat) => {
        categoryMap.set(Number(cat.categoryId), {
          categoryId: cat.categoryId,
          categoryRefId: cat.categoryRefId,
          categoryRef: cat.categoryRef
            ? {
                categoryRefId: cat.categoryRef.categoryRefId,
                categoryName: cat.categoryRef.categoryName,
                subCategoryName: cat.categoryRef.subCategoryName,
                image: cat.categoryRef.image,
              }
            : null,
        });
      });
    }

    // Attach category info to services
    const servicesWithCategory: ServiceDAO[] = services.map((service) => ({
      ...service,
      category:
        service.categoryId !== null && service.categoryId !== undefined
          ? categoryMap.get(service.categoryId) || null
          : null,
    }));

    return {
      data: servicesWithCategory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, storeSlug?: string): Promise<ServiceDAO | null> {
    const where: Prisma.ServiceWhereInput = {
      serviceSlug: slug,
      isDeleted: false,
      isActive: true,
      isApproved: true,
      ...(storeSlug && {
        business: {
          businessSlug: storeSlug,
          isActive: true,
        },
      }),
    };

    const service = await prisma.service.findFirst({
      where,
      include: {
        business: {
          select: {
            businessId: true,
            businessName: true,
            businessSlug: true,
            logoImage: true,
          },
        },
        variations: {
          orderBy: [{ duration: 'asc' }, { displayText: 'asc' }],
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!service) {
      return null;
    }

    // Fetch category information
    let category: ServiceDAO['category'] = null;
    if (service.categoryId !== null && service.categoryId !== undefined) {
      const categoryData = await prisma.category.findFirst({
        where: {
          categoryId: BigInt(service.categoryId),
          isActive: true,
        },
        include: {
          categoryRef: true,
        },
      });

      if (categoryData) {
        category = {
          categoryId: categoryData.categoryId,
          categoryRefId: categoryData.categoryRefId,
          categoryRef: categoryData.categoryRef
            ? {
                categoryRefId: categoryData.categoryRef.categoryRefId,
                categoryName: categoryData.categoryRef.categoryName,
                subCategoryName: categoryData.categoryRef.subCategoryName,
                image: categoryData.categoryRef.image,
              }
            : null,
        };
      }
    }

    return {
      ...service,
      category,
    };
  }

  private getOrderBy(sortBy?: string): Prisma.ServiceOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { basePrice: 'asc' };
      case 'price_desc':
        return { basePrice: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}
