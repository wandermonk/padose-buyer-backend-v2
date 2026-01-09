// Repository Pattern: Abstracts database access
// Works with Business table (stores are businesses)

import { getPrismaClient } from '../config/database';
import { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

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
  include?: Prisma.BusinessInclude;
}

/**
 * Repository for Business (Store) data access
 */
export class StoreRepository {
  /**
   * Find all businesses (stores) with pagination
   */
  async findAll(
    filters: StoreRepositoryFilters = {},
    options: StoreRepositoryOptions = {}
  ) {
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
        include: options.include || {
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

  /**
   * Find business (store) by slug
   */
  async findBySlug(slug: string) {
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

  /**
   * Find business by ID
   */
  async findById(id: string) {
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

  /**
   * Count businesses
   */
  async count(filters: StoreRepositoryFilters = {}) {
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

