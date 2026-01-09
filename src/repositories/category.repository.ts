import { getPrismaClient } from '../config/database';
import { Prisma } from '@prisma/client';

const prisma = getPrismaClient();

export class CategoryRepository {
  /**
   * Find all product categories from category_ref
   */
  async findAllProductCategories() {
    return prisma.categoryRef.findMany({
      where: { 
        isActive: true,
        categoryType: 'product',
      },
      include: {
        _count: {
          select: {
            categories: {
              where: {
                isActive: true,
                products: {
                  some: {
                    isDeleted: false,
                    isActive: true,
                    isApproved: true,
                    entityType: 'product',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { categoryName: 'asc' },
    });
  }

  /**
   * Find all service categories from category_ref
   */
  async findAllServiceCategories() {
    return prisma.categoryRef.findMany({
      where: { 
        isActive: true,
        categoryType: 'service',
      },
      include: {
        _count: {
          select: {
            categories: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { categoryName: 'asc' },
    });
  }

  /**
   * Find product category by slug (generated from name)
   */
  async findProductCategoryBySlug(slug: string) {
    // Extract name from slug (remove id suffix)
    const nameMatch = slug.match(/^(.+)-(\d+)$/);
    const searchName = nameMatch ? nameMatch[1].replace(/-/g, ' ') : slug.replace(/-/g, ' ');
    
    return prisma.categoryRef.findFirst({
      where: { 
        isActive: true,
        categoryType: 'product',
        categoryName: {
          contains: searchName,
          mode: 'insensitive',
        },
      },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            products: {
              where: {
                isDeleted: false,
                isActive: true,
                isApproved: true,
                entityType: 'product',
              },
              select: { productId: true },
            },
          },
        },
      },
    });
  }

  /**
   * Find service category by slug (generated from name)
   */
  async findServiceCategoryBySlug(slug: string) {
    // Extract name from slug (remove id suffix)
    const nameMatch = slug.match(/^(.+)-(\d+)$/);
    const searchName = nameMatch ? nameMatch[1].replace(/-/g, ' ') : slug.replace(/-/g, ' ');
    
    return prisma.categoryRef.findFirst({
      where: { 
        isActive: true,
        categoryType: 'service',
        categoryName: {
          contains: searchName,
          mode: 'insensitive',
        },
      },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            business: {
              select: {
                businessId: true,
              },
            },
          },
        },
      },
    });
  }
}

