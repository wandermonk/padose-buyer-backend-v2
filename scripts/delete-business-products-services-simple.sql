-- Simplified SQL Queries to Delete All Products and Services for a Business
-- This version assumes CASCADE DELETE is properly configured in the database
-- Replace :business_id with the actual business ID (e.g., 123)

-- ============================================================================
-- SOFT DELETE (Recommended - Preserves data for recovery)
-- ============================================================================

-- Soft delete all services (variations and images will be handled by application)
UPDATE services
SET is_deleted = true,
    is_active = false,
    updated_at = NOW()
WHERE business_id = :business_id
  AND is_deleted = false;

-- Soft delete all products (variations and images will be handled by application)
UPDATE product
SET is_deleted = true,
    is_active = false,
    updated_on = NOW()
WHERE category_id IN (
    SELECT category_id
    FROM category
    WHERE business_id = :business_id
)
AND is_deleted = false;

-- ============================================================================
-- HARD DELETE (Permanently removes - uses CASCADE if configured)
-- ============================================================================

-- Delete services (CASCADE should automatically delete variations and images)
DELETE FROM services
WHERE business_id = :business_id;

-- Delete products (CASCADE should automatically delete variations and images)
DELETE FROM product
WHERE category_id IN (
    SELECT category_id
    FROM category
    WHERE business_id = :business_id
);

-- ============================================================================
-- HARD DELETE WITH EXPLICIT CASCADE (If CASCADE is not configured)
-- ============================================================================

-- Delete in order: variations -> images -> products/services

-- 1. Delete service variations
DELETE FROM service_variation
WHERE service_id IN (
    SELECT service_id FROM services WHERE business_id = :business_id
);

-- 2. Delete product variations
DELETE FROM product_variation
WHERE product_id IN (
    SELECT product_id FROM product
    WHERE category_id IN (
        SELECT category_id FROM category WHERE business_id = :business_id
    )
);

-- 3. Delete entity images for services
DELETE FROM entity_images
WHERE service_id IN (
    SELECT service_id FROM services WHERE business_id = :business_id
);

-- 4. Delete entity images for products
DELETE FROM entity_images
WHERE product_id IN (
    SELECT product_id FROM product
    WHERE category_id IN (
        SELECT category_id FROM category WHERE business_id = :business_id
    )
);

-- 5. Delete services
DELETE FROM services
WHERE business_id = :business_id;

-- 6. Delete products
DELETE FROM product
WHERE category_id IN (
    SELECT category_id FROM category WHERE business_id = :business_id
);

-- ============================================================================
-- VERIFICATION (Run before deletion)
-- ============================================================================

-- Summary of what will be deleted
SELECT 
    'Services' as entity_type,
    COUNT(*) as count
FROM services
WHERE business_id = :business_id AND is_deleted = false

UNION ALL

SELECT 
    'Service Variations' as entity_type,
    COUNT(*) as count
FROM service_variation sv
INNER JOIN services s ON sv.service_id = s.service_id
WHERE s.business_id = :business_id

UNION ALL

SELECT 
    'Products' as entity_type,
    COUNT(*) as count
FROM product p
INNER JOIN category c ON p.category_id = c.category_id
WHERE c.business_id = :business_id AND p.is_deleted = false

UNION ALL

SELECT 
    'Product Variations' as entity_type,
    COUNT(*) as count
FROM product_variation pv
INNER JOIN product p ON pv.product_id = p.product_id
INNER JOIN category c ON p.category_id = c.category_id
WHERE c.business_id = :business_id

UNION ALL

SELECT 
    'Service Images' as entity_type,
    COUNT(*) as count
FROM entity_images ei
INNER JOIN services s ON ei.service_id = s.service_id
WHERE s.business_id = :business_id

UNION ALL

SELECT 
    'Product Images' as entity_type,
    COUNT(*) as count
FROM entity_images ei
INNER JOIN product p ON ei.product_id = p.product_id
INNER JOIN category c ON p.category_id = c.category_id
WHERE c.business_id = :business_id;

