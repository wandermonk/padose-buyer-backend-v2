import { getPrismaClient } from '../config/database';
import type { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

// Use Prisma-generated types
// Note: businessTiming and tags are excluded from queries to avoid JSON parsing issues
// They are set to null in the returned data
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
}> & {
  businessTiming?: Prisma.JsonValue | null;
  tags?: Prisma.JsonValue | null;
};

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
    const limit = Math.min(options.limit || 20, 500);
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
        select: {
          businessId: true,
          businessName: true,
          sellerId: true,
          contactNumber: true,
          whatsappNumber: true,
          emailAddress: true,
          isVerified: true,
          isActive: true,
          address: true,
          city: true,
          state: true,
          country: true,
          pincode: true,
          sellRegion: true,
          logoImage: true,
          idType: true,
          idNumber: true,
          isIdVerified: true,
          upiId: true,
          registrationDt: true,
          verifiedDt: true,
          description: true,
          rating: true,
          latitude: true,
          longitude: true,
          district: true,
          storeStatus: true,
          autoCloseEnabled: true,
          manualStatusUntil: true,
          breakStartTime: true,
          breakEndTime: true,
          acceptingOrders: true,
          holidayMode: true,
          holidayMessage: true,
          officialBusinessName: true,
          gstNumber: true,
          panNumber: true,
          businessSlug: true,
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

    // Add businessTiming and tags as null since we're excluding them to avoid JSON parsing issues
    const businessesWithDefaults = businesses.map(b => ({
      ...b,
      businessTiming: null,
      tags: null,
    })) as BusinessDAO[];

    return {
      data: businessesWithDefaults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string): Promise<BusinessDAO | null> {
    const business = await prisma.business.findFirst({
      where: { 
        businessSlug: slug, 
        isActive: true 
      },
      select: {
        businessId: true,
        businessName: true,
        sellerId: true,
        contactNumber: true,
        whatsappNumber: true,
        emailAddress: true,
        isVerified: true,
        isActive: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        sellRegion: true,
        logoImage: true,
        idType: true,
        idNumber: true,
        isIdVerified: true,
        upiId: true,
        registrationDt: true,
        verifiedDt: true,
        description: true,
        rating: true,
        latitude: true,
        longitude: true,
        district: true,
        storeStatus: true,
        autoCloseEnabled: true,
        manualStatusUntil: true,
        breakStartTime: true,
        breakEndTime: true,
        acceptingOrders: true,
        holidayMode: true,
        holidayMessage: true,
        officialBusinessName: true,
        gstNumber: true,
        panNumber: true,
        businessSlug: true,
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
    
    // Add businessTiming and tags as null since we're excluding them to avoid JSON parsing issues
    return business ? { ...business, businessTiming: null, tags: null } as BusinessDAO : null;
  }

  async findById(id: string): Promise<BusinessDAO | null> {
    const business = await prisma.business.findUnique({
      where: { businessId: BigInt(id) },
      select: {
        businessId: true,
        businessName: true,
        sellerId: true,
        contactNumber: true,
        whatsappNumber: true,
        emailAddress: true,
        isVerified: true,
        isActive: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        sellRegion: true,
        logoImage: true,
        idType: true,
        idNumber: true,
        isIdVerified: true,
        upiId: true,
        registrationDt: true,
        verifiedDt: true,
        description: true,
        rating: true,
        latitude: true,
        longitude: true,
        district: true,
        storeStatus: true,
        autoCloseEnabled: true,
        manualStatusUntil: true,
        breakStartTime: true,
        breakEndTime: true,
        acceptingOrders: true,
        holidayMode: true,
        holidayMessage: true,
        officialBusinessName: true,
        gstNumber: true,
        panNumber: true,
        businessSlug: true,
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
    
    // Add businessTiming and tags as null since we're excluding them to avoid JSON parsing issues
    return business ? { ...business, businessTiming: null, tags: null } as BusinessDAO : null;
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
