-- SQL Queries to Delete All Products and Services for a Business
-- Replace :business_id with the actual business ID (e.g., 123)

-- ============================================================================
-- OPTION 1: SOFT DELETE (Recommended - Sets is_deleted = true)
-- ============================================================================

-- Soft delete all services for a business
-- Service variations will be handled by application logic or cascade
UPDATE services
SET is_deleted = true,
    is_active = false,
    updated_at = NOW()
WHERE business_id = :business_id
  AND is_deleted = false;

-- Soft delete all products for a business (via category relationship)
-- Product variations will be handled by application logic or cascade
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
-- OPTION 2: HARD DELETE (Permanently removes records)
-- WARNING: This will permanently delete all data. Use with caution!
-- ============================================================================

-- Delete order: Variations first, then images, then products/services
-- (Note: If CASCADE is set up, you may only need to delete products/services)

-- 1. Delete service variations for services of this business
DELETE FROM service_variation
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- 2. Delete product variations for products of this business
DELETE FROM product_variation
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- 3. Delete entity images for services of this business
DELETE FROM entity_images
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- 4. Delete entity images for products of this business
DELETE FROM entity_images
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- 5. Delete services for this business
DELETE FROM services
WHERE business_id = :business_id;

-- 6. Delete products for this business
DELETE FROM product
WHERE category_id IN (
    SELECT category_id
    FROM category
    WHERE business_id = :business_id
);

-- ============================================================================
-- OPTION 3: TRANSACTION WITH HARD DELETE (Safest for hard deletes)
-- ============================================================================

BEGIN;

-- Delete service variations
DELETE FROM service_variation
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- Delete product variations
DELETE FROM product_variation
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- Delete entity images for services
DELETE FROM entity_images
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- Delete entity images for products
DELETE FROM entity_images
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- Delete services
DELETE FROM services
WHERE business_id = :business_id;

-- Delete products
DELETE FROM product
WHERE category_id IN (
    SELECT category_id
    FROM category
    WHERE business_id = :business_id
);

-- If everything looks good, commit. Otherwise, rollback.
COMMIT;
-- ROLLBACK; -- Uncomment this line to undo if needed

-- ============================================================================
-- VERIFICATION QUERIES (Run before deletion to see what will be deleted)
-- ============================================================================

-- Count services for this business
SELECT COUNT(*) as service_count
FROM services
WHERE business_id = :business_id
  AND is_deleted = false;

-- Count service variations
SELECT COUNT(*) as service_variation_count
FROM service_variation
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- Count products for this business
SELECT COUNT(*) as product_count
FROM product
WHERE category_id IN (
    SELECT category_id
    FROM category
    WHERE business_id = :business_id
)
AND is_deleted = false;

-- Count product variations
SELECT COUNT(*) as product_variation_count
FROM product_variation
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- Count entity images for services
SELECT COUNT(*) as service_image_count
FROM entity_images
WHERE service_id IN (
    SELECT service_id
    FROM services
    WHERE business_id = :business_id
);

-- Count entity images for products
SELECT COUNT(*) as product_image_count
FROM entity_images
WHERE product_id IN (
    SELECT product_id
    FROM product
    WHERE category_id IN (
        SELECT category_id
        FROM category
        WHERE business_id = :business_id
    )
);

-- ============================================================================
-- EXAMPLE USAGE:
-- ============================================================================
-- Replace :business_id with actual value, e.g.:
-- 
-- For PostgreSQL/psql:
-- \set business_id 123
-- 
-- For MySQL:
-- SET @business_id = 123;
-- 
-- For direct SQL (replace manually):
-- WHERE business_id = 123
-- 
-- ============================================================================

