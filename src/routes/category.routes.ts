import { Router, Request, Response, NextFunction } from 'express';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductDataAccess } from '../models/product.dao';
import { ServiceDataAccess } from '../models/service.dao';
import { sendSuccess } from '../utils/response';
import { parsePaginationParams } from '../utils/pagination';
import { mapProductToDto } from '../mappers/product.mapper';
import { mapServiceToDto } from '../mappers/service.mapper';

const router = Router();

const categoryRepository = new CategoryRepository();
const productDAO = new ProductDataAccess();
const serviceDAO = new ServiceDataAccess();

// Get all product categories
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryRepository.findAllProductCategories();
    
    // Count products for each category
    const { getPrismaClient } = await import('../config/database');
    const prisma = getPrismaClient();
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await prisma.product.count({
          where: {
            isDeleted: false,
            isActive: true,
            isApproved: true,
            entityType: 'product',
            category: {
              categoryRefId: cat.categoryRefId,
              isActive: true,
            },
          },
        });
        
        return {
          id: String(cat.categoryRefId),
          name: cat.categoryName || '',
          slug: cat.categoryName 
            ? cat.categoryName.toLowerCase().replace(/\s+/g, '-') + `-${cat.categoryRefId}`
            : `category-${cat.categoryRefId}`,
          description: undefined, // Not in category_ref
          image: cat.image || undefined,
          productCount,
        };
      })
    );
    
    sendSuccess(res, {
      categories: categoriesWithCounts,
    });
  } catch (error) {
    next(error);
  }
});

// Get all service categories
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryRepository.findAllServiceCategories();
    
    // Count services for each category
    const { getPrismaClient } = await import('../config/database');
    const prisma = getPrismaClient();
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const serviceCount = await prisma.service.count({
          where: {
            isDeleted: false,
            isActive: true,
            isApproved: true,
            categoryId: {
              not: null,
            },
          },
        });
        
        return {
          id: String(cat.categoryRefId),
          name: cat.categoryName || '',
          slug: cat.categoryName 
            ? cat.categoryName.toLowerCase().replace(/\s+/g, '-') + `-${cat.categoryRefId}`
            : `category-${cat.categoryRefId}`,
          description: undefined, // Not in category_ref
          image: cat.image || undefined,
          serviceCount,
        };
      })
    );
    
    sendSuccess(res, {
      categories: categoriesWithCounts,
    });
  } catch (error) {
    next(error);
  }
});

// Get product category by slug with products
router.get('/products/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await categoryRepository.findProductCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product category with slug "${slug}" not found`,
        },
      });
    }

    const params = parsePaginationParams(req.query);
    const storeSlug = req.query.store as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;

    // Get products for this category
    const { getPrismaClient } = await import('../config/database');
    const prisma = getPrismaClient();
    
    const categoryIds = category.categories.map(c => c.categoryId);
    
    const productsResult = await productDAO.findAll(
      {
        categorySlug: slug,
        storeSlug,
        isActive: true,
      },
      {
        page: params.page,
        limit: params.limit,
        sortBy: sortBy as any,
      }
    );

    // Get unique store count for this category
    const uniqueStores = new Set<bigint>();
    category.categories.forEach(cat => {
      if (cat.businessId) {
        uniqueStores.add(cat.businessId);
      }
    });

    const productCount = await prisma.product.count({
      where: {
        isDeleted: false,
        isActive: true,
        isApproved: true,
        entityType: 'product',
        categoryId: { in: categoryIds },
      },
    });

    sendSuccess(res, {
      category: {
        id: String(category.categoryRefId),
        name: category.categoryName || '',
        slug: category.categoryName 
          ? category.categoryName.toLowerCase().replace(/\s+/g, '-') + `-${category.categoryRefId}`
          : `category-${category.categoryRefId}`,
        description: undefined,
        image: category.image || undefined,
        productCount,
        serviceCount: 0,
        storeCount: uniqueStores.size,
      },
      products: productsResult.data.map(mapProductToDto),
      pagination: productsResult.pagination,
    });
  } catch (error) {
    next(error);
  }
});

// Get service category by slug with services
router.get('/services/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await categoryRepository.findServiceCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Service category with slug "${slug}" not found`,
        },
      });
    }

    const params = parsePaginationParams(req.query);
    const storeSlug = req.query.store as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;

    const servicesResult = await serviceDAO.findAll(
      {
        categorySlug: slug,
        storeSlug,
        isActive: true,
      },
      {
        page: params.page,
        limit: params.limit,
        sortBy: sortBy as any,
      }
    );

    // Get unique store count for this category
    const uniqueStores = new Set<bigint>();
    category.categories.forEach(cat => {
      if (cat.businessId) {
        uniqueStores.add(cat.businessId);
      }
    });

    const { getPrismaClient } = await import('../config/database');
    const prisma = getPrismaClient();
    
    const categoryIds = category.categories.map(c => c.categoryId);
    
    const serviceCount = await prisma.service.count({
      where: {
        isDeleted: false,
        isActive: true,
        isApproved: true,
        categoryId: { in: categoryIds.map(Number) },
      },
    });

    sendSuccess(res, {
      category: {
        id: String(category.categoryRefId),
        name: category.categoryName || '',
        slug: category.categoryName 
          ? category.categoryName.toLowerCase().replace(/\s+/g, '-') + `-${category.categoryRefId}`
          : `category-${category.categoryRefId}`,
        description: undefined,
        image: category.image || undefined,
        productCount: 0,
        serviceCount,
        storeCount: uniqueStores.size,
      },
      services: servicesResult.data.map(mapServiceToDto),
      pagination: servicesResult.pagination,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

