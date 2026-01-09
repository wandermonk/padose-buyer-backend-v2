import { getPrismaClient } from '../config/database';
import { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

export interface ServiceRepositoryFilters {
  storeSlug?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  businessId?: number;
}

export interface ServiceRepositoryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  include?: Prisma.ServiceInclude;
}

export class ServiceRepository {
  async findAll(
    filters: ServiceRepositoryFilters = {},
    options: ServiceRepositoryOptions = {}
  ) {
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
          categoryType: 'service',
        },
      };
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
      ...(categoryFilter && {
        category: categoryFilter,
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
        include: options.include || {
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

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, storeSlug?: string) {
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

    return prisma.service.findFirst({
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
  }

  private getOrderBy(sortBy?: string): Prisma.ServiceOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { basePrice: 'asc' };
      case 'price_desc':
        return { basePrice: 'desc' };
      case 'rating':
        return { createdAt: 'desc' }; // Rating not in services table
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}

