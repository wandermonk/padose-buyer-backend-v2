# Padose Buyer App - Backend API

A Node.js backend API built with Express, TypeScript, and Prisma, following SOLID principles and RESTful design.

## Architecture

This backend follows a clean architecture pattern with clear separation of concerns:

- **DTOs (Data Transfer Objects)**: Define the API response structure
- **Mappers**: Transform database models to DTOs (handles different DB structures)
- **Repositories**: Abstract database access layer
- **Services**: Business logic layer
- **Controllers**: HTTP request/response handling
- **Routes**: RESTful route definitions
- **Middleware**: Error handling, validation

## Features

- ✅ RESTful API design
- ✅ TypeScript for type safety
- ✅ Prisma ORM for database access
- ✅ SOLID principles
- ✅ Flexible mapping between DB structure and API responses
- ✅ Error handling middleware
- ✅ Pagination support
- ✅ Search functionality

## Setup

### Prerequisites

- Node.js 20+ 
- PostgreSQL database (or Supabase)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase database connection string:
```
# Use SUPABASE_DATABASE_URL (recommended) or DATABASE_URL
SUPABASE_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true&connection_limit=1"

# Or use DATABASE_URL directly
# DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
PORT=3000
NODE_ENV=development
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Test database connection:
```bash
npm run test:connection
```

This will verify that Prisma can connect to your Supabase database and check if tables are accessible.

5. (Optional) Push schema to database:
```bash
npm run prisma:push
```

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api`

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

### Quick Reference

- `GET /api/stores` - Get all stores
- `GET /api/stores/:slug` - Get store by slug
- `GET /api/stores/:slug/products` - Get store products
- `GET /api/stores/:slug/services` - Get store services
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product by slug
- `GET /api/services` - Get all services
- `GET /api/services/:slug` - Get service by slug
- `GET /api/categories/products` - Get product categories
- `GET /api/categories/services` - Get service categories
- `GET /api/categories/products/:slug` - Get category with products
- `GET /api/categories/services/:slug` - Get category with services
- `GET /api/search?q=query&type=all` - Search across products, services, stores

## Database Structure Mapping

This backend is designed to work with different database structures. The mapping layer (`src/mappers/`) transforms your database models to match the API response structure (DTOs).

### Customizing Mappers

If your database structure differs from the Prisma schema, update the mapper functions in:
- `src/mappers/store.mapper.ts`
- `src/mappers/product.mapper.ts`
- `src/mappers/service.mapper.ts`

Each mapper has a `mapFromCustomStructure` function that you can implement based on your actual database structure.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration files
│   ├── controllers/           # HTTP request handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Data access layer
│   ├── mappers/               # DB to DTO transformers
│   ├── dtos/                  # Data Transfer Objects
│   ├── routes/                # Route definitions
│   ├── middleware/            # Express middleware
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   └── server.ts             # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Prisma Studio

View and edit your database:
```bash
npm run prisma:studio
```

### Database Migrations

Create a migration:
```bash
npm run prisma:migrate
```

## License

ISC

