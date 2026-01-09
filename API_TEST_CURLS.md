# API Testing with cURL Commands

This document provides comprehensive cURL commands to test all API endpoints organized by module.

**Base URL:** `http://localhost:3000`  
**API Prefix:** `/api`

---

## 🏥 Health Check

### Check Server Status
```bash
curl -X GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏪 Store Module (`/api/stores`)

### 1. Get All Stores
```bash
# Basic request
curl -X GET "http://localhost:3000/api/stores"

# With pagination
curl -X GET "http://localhost:3000/api/stores?page=1&limit=10"

# With search
curl -X GET "http://localhost:3000/api/stores?search=grocery&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for store name or description

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "1",
        "name": "Store Name",
        "slug": "store-name-1",
        "description": "Store description",
        "logo": "https://...",
        "rating": 4.5,
        "ratingCount": 100,
        "productCount": 50,
        "serviceCount": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2. Get Store by Slug
```bash
curl -X GET "http://localhost:3000/api/stores/store-slug-here"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Store Name",
    "slug": "store-slug-here",
    "description": "Store description",
    "logo": "https://...",
    "rating": 4.5,
    "ratingCount": 100,
    "productCount": 50,
    "serviceCount": 10,
    "categories": [
      {
        "id": "1",
        "name": "Category Name",
        "slug": "category-name-1"
      }
    ]
  }
}
```

### 3. Get Store Products
```bash
# Get all products from a store
curl -X GET "http://localhost:3000/api/stores/store-slug-here/products"

# With pagination
curl -X GET "http://localhost:3000/api/stores/store-slug-here/products?page=1&limit=20"

# With category filter
curl -X GET "http://localhost:3000/api/stores/store-slug-here/products?category=fruits&page=1&limit=20"

# With search
curl -X GET "http://localhost:3000/api/stores/store-slug-here/products?search=apple&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Category slug
- `search` (optional): Search term

### 4. Get Store Services
```bash
# Get all services from a store
curl -X GET "http://localhost:3000/api/stores/store-slug-here/services"

# With pagination
curl -X GET "http://localhost:3000/api/stores/store-slug-here/services?page=1&limit=20"

# With category filter
curl -X GET "http://localhost:3000/api/stores/store-slug-here/services?category=cleaning&page=1&limit=20"

# With search
curl -X GET "http://localhost:3000/api/stores/store-slug-here/services?search=plumbing&page=1&limit=20"
```

---

## 📦 Product Module (`/api/products`)

### 1. Get All Products
```bash
# Basic request
curl -X GET "http://localhost:3000/api/products"

# With pagination
curl -X GET "http://localhost:3000/api/products?page=1&limit=20"

# Filter by store
curl -X GET "http://localhost:3000/api/products?store=store-slug-here&page=1&limit=20"

# Filter by category
curl -X GET "http://localhost:3000/api/products?category=fruits&page=1&limit=20"

# Search products
curl -X GET "http://localhost:3000/api/products?search=apple&page=1&limit=20"

# Filter by price range
curl -X GET "http://localhost:3000/api/products?minPrice=10&maxPrice=100&page=1&limit=20"

# Sort products
curl -X GET "http://localhost:3000/api/products?sortBy=price_asc&page=1&limit=20"
curl -X GET "http://localhost:3000/api/products?sortBy=price_desc&page=1&limit=20"
curl -X GET "http://localhost:3000/api/products?sortBy=newest&page=1&limit=20"
curl -X GET "http://localhost:3000/api/products?sortBy=rating&page=1&limit=20"

# Combined filters
curl -X GET "http://localhost:3000/api/products?store=store-slug&category=fruits&minPrice=10&maxPrice=50&sortBy=price_asc&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `store` (optional): Store slug to filter products
- `category` (optional): Category slug to filter products
- `search` (optional): Search term for product name, description, or keywords
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort order - `price_asc`, `price_desc`, `newest`, `rating`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "1",
        "name": "Product Name",
        "slug": "product-slug-1",
        "description": "Product description",
        "images": ["https://..."],
        "price": 99.99,
        "originalPrice": 129.99,
        "discount": 23,
        "stock": 100,
        "store": {
          "id": "1",
          "name": "Store Name",
          "slug": "store-slug",
          "logo": "https://..."
        },
        "category": {
          "id": "1",
          "name": "Category Name",
          "slug": "category-slug"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  }
}
```

### 2. Get Product by Slug
```bash
# Basic request
curl -X GET "http://localhost:3000/api/products/product-slug-here"

# With store filter (to ensure product belongs to specific store)
curl -X GET "http://localhost:3000/api/products/product-slug-here?store=store-slug-here"
```

**Query Parameters:**
- `store` (optional): Store slug to verify product belongs to this store

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Product Name",
    "slug": "product-slug-here",
    "description": "Product description",
    "images": ["https://..."],
    "price": 99.99,
    "originalPrice": 129.99,
    "discount": 23,
    "stock": 100,
    "store": {
      "id": "1",
      "name": "Store Name",
      "slug": "store-slug",
      "logo": "https://..."
    },
    "category": {
      "id": "1",
      "name": "Category Name",
      "slug": "category-slug"
    },
    "variations": [
      {
        "id": "1",
        "type": "size",
        "name": "Large",
        "value": "L",
        "priceModifier": 10,
        "stock": 50
      }
    ]
  }
}
```

---

## 🔧 Service Module (`/api/services`)

### 1. Get All Services
```bash
# Basic request
curl -X GET "http://localhost:3000/api/services"

# With pagination
curl -X GET "http://localhost:3000/api/services?page=1&limit=20"

# Filter by store
curl -X GET "http://localhost:3000/api/services?store=store-slug-here&page=1&limit=20"

# Filter by category
curl -X GET "http://localhost:3000/api/services?category=cleaning&page=1&limit=20"

# Search services
curl -X GET "http://localhost:3000/api/services?search=plumbing&page=1&limit=20"

# Filter by price range
curl -X GET "http://localhost:3000/api/services?minPrice=50&maxPrice=500&page=1&limit=20"

# Sort services
curl -X GET "http://localhost:3000/api/services?sortBy=price_asc&page=1&limit=20"
curl -X GET "http://localhost:3000/api/services?sortBy=price_desc&page=1&limit=20"
curl -X GET "http://localhost:3000/api/services?sortBy=newest&page=1&limit=20"

# Combined filters
curl -X GET "http://localhost:3000/api/services?store=store-slug&category=cleaning&minPrice=100&maxPrice=300&sortBy=price_asc&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `store` (optional): Store slug to filter services
- `category` (optional): Category slug to filter services
- `search` (optional): Search term for service name or description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort order - `price_asc`, `price_desc`, `newest`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "1",
        "name": "Service Name",
        "slug": "service-slug-1",
        "description": "Service description",
        "images": ["https://..."],
        "basePrice": 199.99,
        "rating": 4.5,
        "ratingCount": 50,
        "store": {
          "id": "1",
          "name": "Store Name",
          "slug": "store-slug",
          "logo": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

### 2. Get Service by Slug
```bash
# Basic request
curl -X GET "http://localhost:3000/api/services/service-slug-here"

# With store filter
curl -X GET "http://localhost:3000/api/services/service-slug-here?store=store-slug-here"
```

**Query Parameters:**
- `store` (optional): Store slug to verify service belongs to this store

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Service Name",
    "slug": "service-slug-here",
    "description": "Service description",
    "images": ["https://..."],
    "basePrice": 199.99,
    "rating": 4.5,
    "ratingCount": 50,
    "store": {
      "id": "1",
      "name": "Store Name",
      "slug": "store-slug",
      "logo": "https://..."
    },
    "packages": [
      {
        "id": "1",
        "name": "Basic Package",
        "price": 199.99,
        "description": "Basic service package"
      }
    ],
    "variations": [
      {
        "id": "1",
        "type": "duration",
        "name": "2 hours",
        "value": "2h",
        "priceModifier": 0
      }
    ]
  }
}
```

---

## 🔍 Search Module (`/api/search`)

### Search All Types
```bash
# Search everything (products, services, stores)
curl -X GET "http://localhost:3000/api/search?q=apple&type=all&page=1&limit=20"
```

### Search Products Only
```bash
curl -X GET "http://localhost:3000/api/search?q=apple&type=products&page=1&limit=20"
```

### Search Services Only
```bash
curl -X GET "http://localhost:3000/api/search?q=plumbing&type=services&page=1&limit=20"
```

### Search Stores Only
```bash
curl -X GET "http://localhost:3000/api/search?q=grocery&type=stores&page=1&limit=20"
```

**Query Parameters:**
- `q` (required): Search query string
- `type` (optional): Type of search - `all`, `products`, `services`, `stores` (default: `all`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "query": "apple",
    "results": {
      "products": [
        {
          "id": "1",
          "name": "Apple",
          "slug": "apple-1",
          "price": 29.99,
          "store": { ... }
        }
      ],
      "services": [],
      "stores": []
    },
    "counts": {
      "products": 10,
      "services": 0,
      "stores": 0,
      "total": 10
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

## 📂 Category Module (`/api/categories`)

### 1. Get All Product Categories
```bash
curl -X GET "http://localhost:3000/api/categories/products"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "1",
        "name": "Fruits",
        "slug": "fruits-1",
        "description": null,
        "image": "https://...",
        "productCount": 50
      }
    ]
  }
}
```

### 2. Get All Service Categories
```bash
curl -X GET "http://localhost:3000/api/categories/services"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "1",
        "name": "Cleaning",
        "slug": "cleaning-1",
        "description": null,
        "image": "https://...",
        "serviceCount": 25
      }
    ]
  }
}
```

### 3. Get Product Category by Slug with Products
```bash
# Basic request
curl -X GET "http://localhost:3000/api/categories/products/fruits-1"

# With pagination
curl -X GET "http://localhost:3000/api/categories/products/fruits-1?page=1&limit=20"

# Filter by store
curl -X GET "http://localhost:3000/api/categories/products/fruits-1?store=store-slug&page=1&limit=20"

# With sorting
curl -X GET "http://localhost:3000/api/categories/products/fruits-1?sortBy=price_asc&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `store` (optional): Store slug to filter products
- `sortBy` (optional): Sort order

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "1",
      "name": "Fruits",
      "slug": "fruits-1",
      "description": null,
      "image": "https://...",
      "productCount": 50,
      "serviceCount": 0,
      "storeCount": 10
    },
    "products": [
      {
        "id": "1",
        "name": "Apple",
        "slug": "apple-1",
        "price": 29.99,
        "store": { ... }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 4. Get Service Category by Slug with Services
```bash
# Basic request
curl -X GET "http://localhost:3000/api/categories/services/cleaning-1"

# With pagination
curl -X GET "http://localhost:3000/api/categories/services/cleaning-1?page=1&limit=20"

# Filter by store
curl -X GET "http://localhost:3000/api/categories/services/cleaning-1?store=store-slug&page=1&limit=20"

# With sorting
curl -X GET "http://localhost:3000/api/categories/services/cleaning-1?sortBy=price_asc&page=1&limit=20"
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `store` (optional): Store slug to filter services
- `sortBy` (optional): Sort order

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "1",
      "name": "Cleaning",
      "slug": "cleaning-1",
      "description": null,
      "image": "https://...",
      "productCount": 0,
      "serviceCount": 25,
      "storeCount": 8
    },
    "services": [
      {
        "id": "1",
        "name": "House Cleaning",
        "slug": "house-cleaning-1",
        "basePrice": 199.99,
        "store": { ... }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

## 📝 Testing Tips

### 1. Pretty Print JSON Responses
Add `| jq` to format JSON responses (requires jq installed):
```bash
curl -X GET "http://localhost:3000/api/products" | jq
```

### 2. Save Response to File
```bash
curl -X GET "http://localhost:3000/api/products" -o response.json
```

### 3. Include Headers in Request
```bash
curl -X GET "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### 4. Verbose Output (Debug)
```bash
curl -v -X GET "http://localhost:3000/api/products"
```

### 5. Test Error Handling
```bash
# Test 404 - Non-existent product
curl -X GET "http://localhost:3000/api/products/non-existent-slug"

# Test 404 - Non-existent store
curl -X GET "http://localhost:3000/api/stores/non-existent-slug"
```

---

## 🚀 Quick Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🏥 Testing Health Check..."
curl -s "$BASE_URL/health" | jq

echo -e "\n📦 Testing Products..."
curl -s "$BASE_URL/api/products?page=1&limit=5" | jq '.data.products | length'

echo -e "\n🏪 Testing Stores..."
curl -s "$BASE_URL/api/stores?page=1&limit=5" | jq '.data.stores | length'

echo -e "\n🔧 Testing Services..."
curl -s "$BASE_URL/api/services?page=1&limit=5" | jq '.data.services | length'

echo -e "\n🔍 Testing Search..."
curl -s "$BASE_URL/api/search?q=test&type=all&page=1&limit=5" | jq '.data.counts'

echo -e "\n📂 Testing Categories..."
curl -s "$BASE_URL/api/categories/products" | jq '.data.categories | length'

echo -e "\n✅ All tests completed!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📊 Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

---

## 🔗 Complete API Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/stores` | Get all stores |
| GET | `/api/stores/:slug` | Get store by slug |
| GET | `/api/stores/:slug/products` | Get store products |
| GET | `/api/stores/:slug/services` | Get store services |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:slug` | Get product by slug |
| GET | `/api/services` | Get all services |
| GET | `/api/services/:slug` | Get service by slug |
| GET | `/api/search` | Search all types |
| GET | `/api/categories/products` | Get product categories |
| GET | `/api/categories/services` | Get service categories |
| GET | `/api/categories/products/:slug` | Get product category with products |
| GET | `/api/categories/services/:slug` | Get service category with services |

---

**Note:** Replace `localhost:3000` with your actual server URL if deployed, and replace slug values with actual slugs from your database.

