import { getPrismaClient } from '../config/database';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// Use Prisma-generated types
export type BusinessDAO = Prisma.BusinessGetPayload<{
  include: {
    services: {
      select: { serviceId: true };
    };
    categories: {
      include: {
        categoryRef: true;
      };
    };
  };
}>;

export interface StoreRepositoryFilters {
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
  city?: string;
  pincode?: string;
}

export interface StoreRepositoryOptions {
  page?: number;
  limit?: number;
}

/**
 * Store Data Access - Uses Prisma Client to connect to Supabase PostgreSQL
 */
export class StoreDataAccess {
  async findAll(
    filters: StoreRepositoryFilters = {},
    options: StoreRepositoryOptions = {}
  ): Promise<{ data: BusinessDAO[]; pagination: any }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BusinessWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
      ...(filters.city && { city: filters.city }),
      ...(filters.pincode && { pincode: filters.pincode }),
      ...(filters.search && {
        OR: [
          { businessName: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        include: {
          services: {
            where: { 
              isDeleted: false,
              isActive: true, 
              isApproved: true,
            },
            select: { serviceId: true },
          },
          categories: {
            include: {
              categoryRef: true,
            },
          },
        },
        orderBy: {
          registrationDt: 'desc',
        },
      }),
      prisma.business.count({ where }),
    ]);

    return {
      data: businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<BusinessDAO | null> {
    return prisma.business.findFirst({
      where: { 
        businessSlug: slug, 
        isActive: true 
      },
      include: {
        services: {
          where: { 
            isDeleted: false,
            isActive: true, 
            isApproved: true,
          },
          select: { serviceId: true },
        },
        categories: {
          where: { isActive: true },
          include: {
            categoryRef: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<BusinessDAO | null> {
    return prisma.business.findUnique({
      where: { businessId: BigInt(id) },
      include: {
        services: {
          where: { 
            isDeleted: false,
            isActive: true, 
            isApproved: true,
          },
          select: { serviceId: true },
        },
        categories: {
          where: { isActive: true },
          include: {
            categoryRef: true,
          },
        },
      },
    });
  }

  async count(filters: StoreRepositoryFilters = {}): Promise<number> {
    const where: Prisma.BusinessWhereInput = {
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      ...(filters.search && {
        OR: [
          { businessName: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.business.count({ where });
  }
}
