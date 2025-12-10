# Multi-Tenant Material Inventory System

A production-ready Node.js backend system implementing a multi-tenant material inventory management platform with tenant-level data isolation, role-based access control (RBAC), plan-based feature restrictions, analytics, and soft delete functionality.

## 🚀 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js v4.18.2
- **ORM**: Prisma v5.7.0
- **Database**: SQLite (development) / PostgreSQL or MySQL (production)
- **Validation**: Zod v3.22.4
- **Environment**: dotenv v16.3.1

## 📁 Project Structure

```
Multi-Tenant Backend Project/
├── prisma/
│   └── schema.prisma          # Database schema with multi-tenant models
├── src/
│   ├── config/                # Configuration files
│   │   └── index.js           # Environment config (PORT, DATABASE_URL, NODE_ENV)
│   ├── controllers/           # Request handlers
│   │   ├── tenantController.js
│   │   ├── materialController.js
│   │   ├── transactionController.js
│   │   ├── analyticsController.js
│   │   └── index.js
│   ├── services/              # Business logic layer
│   │   ├── tenantService.js
│   │   ├── materialService.js
│   │   ├── transactionService.js
│   │   ├── analyticsService.js
│   │   └── index.js
│   ├── routes/                # API route definitions
│   │   ├── tenantRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── index.js
│   ├── middlewares/           # Custom middleware
│   │   ├── tenantMiddleware.js  # Tenant validation & attachment
│   │   ├── authMiddleware.js    # User role authentication
│   │   ├── rbacMiddleware.js    # Role-based access control
│   │   ├── validate.js          # Zod validation middleware
│   │   ├── schemas.js           # Zod validation schemas
│   │   └── index.js
│   ├── utils/                 # Utility functions
│   │   ├── prismaClient.js    # Singleton Prisma client
│   │   ├── logger.js          # Logging utility
│   │   ├── validators.js      # Custom validators
│   │   ├── responseHelper.js  # Response formatters
│   │   └── index.js
│   └── app.js                 # Express application entry point
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🏢 Multi-Tenant Architecture

This system implements **strict tenant-level data isolation**. Each tenant's data is completely separated from others through:

1. **Tenant ID enforcement**: All database queries filter by `tenantId`
2. **Middleware validation**: `x-tenant-id` header is required and validated on every request
3. **Foreign key relationships**: All models are linked to the Tenant model
4. **Plan-based restrictions**: FREE plan users are limited to 5 materials; PRO users get unlimited
5. **Feature gating**: Analytics endpoints are only accessible to PRO plan tenants

## 🔐 Security & Access Control

- **RBAC (Role-Based Access Control)**: Two roles supported - ADMIN and USER
- **Tenant Isolation**: All queries automatically scoped to the tenant making the request
- **Soft Delete**: Materials can be soft-deleted (marked with `deletedAt`) instead of hard deletion

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**:
```bash
cd "Multi-Tenant Backend Project"
```

2. **Install dependencies**:
```bash
npm install
```

This will install:
- Express.js (v4.18.2) - Web framework
- Prisma (v5.7.0) - ORM and database toolkit
- Zod (v3.22.4) - Schema validation
- dotenv (v16.3.1) - Environment variable management
- nodemon (v3.0.2) - Development auto-reload

3. **Create environment file**:
```bash
cp .env.example .env
```

Or on Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

4. **Generate Prisma Client**:
```bash
npx prisma generate
```

5. **Run database migrations**:
```bash
npx prisma migrate dev --name init
```

6. **Start the server**:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT)

## 📚 API Endpoints

### Health Check
```
GET /
```

### Tenant Management
```
POST   /tenants          # Create a new tenant
GET    /tenants          # Get all tenants
```

### Material Management (Requires: x-tenant-id, x-user-role headers)
```
POST   /materials        # Create material (ADMIN only)
GET    /materials        # List all materials (supports filters: name, unit)
GET    /materials/:id    # Get material with transactions
DELETE /materials/:id    # Soft delete material (ADMIN only)
```

### Transaction Management (Requires: x-tenant-id, x-user-role headers)
```
POST   /materials/:id/transactions  # Create IN/OUT transaction
```

### Analytics (Requires: x-tenant-id, x-user-role headers, PRO plan)
```
GET    /analytics/summary  # Get aggregated analytics
```

## 🧪 Example API Requests

### 1. Create a Tenant
```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "plan": "PRO"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "id": "clxy1234abcd",
    "name": "Acme Corporation",
    "plan": "PRO",
    "createdAt": "2025-12-10T10:30:00.000Z"
  }
}
```

### 2. Create a Material (ADMIN only)
```bash
curl -X POST http://localhost:3000/materials \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: ADMIN" \
  -d '{
    "name": "Steel Rods",
    "unit": "kg"
  }'
```

### 3. Get Materials with Filters and Pagination
```bash
# Case-insensitive search with pagination
curl -X GET "http://localhost:3000/materials?name=steel&unit=kg&page=1&limit=10" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: USER"
```

**Response with Pagination**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clxy5678efgh",
      "name": "Steel Rods",
      "unit": "kg",
      "currentStock": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4. Create an IN Transaction
```bash
curl -X POST http://localhost:3000/materials/clxy5678efgh/transactions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: USER" \
  -d '{
    "type": "IN",
    "quantity": 100
  }'
```

### 5. Create an OUT Transaction
```bash
curl -X POST http://localhost:3000/materials/clxy5678efgh/transactions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: USER" \
  -d '{
    "type": "OUT",
    "quantity": 25
  }'
```

### 6. Get Analytics Summary (PRO plan only)
```bash
curl -X GET http://localhost:3000/analytics/summary \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: ADMIN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "materials_count": 12,
    "total_in": 5000,
    "total_out": 2300,
    "total_stock": 2700
  }
}
```

### 7. Soft Delete a Material (ADMIN only)
```bash
curl -X DELETE http://localhost:3000/materials/clxy5678efgh \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: ADMIN"
```

## 🎯 Key Features

### ✅ Multi-Tenancy
- Complete data isolation per tenant
- Tenant validation on every request
- Separate plans (FREE/PRO) with different limits

### ✅ Role-Based Access Control (RBAC)
- **ADMIN**: Can create and delete materials
- **USER**: Can view materials and create transactions

### ✅ Plan-Based Features
- **FREE Plan**: Maximum 5 materials (enforced with Prisma transactions), no analytics
- **PRO Plan**: Unlimited materials, full analytics access

### ✅ Soft Delete
- Materials are marked as deleted instead of being removed
- Soft-deleted materials are excluded from queries
- Maintains data integrity and audit trail

### ✅ Stock Management
- Atomic transactions using Prisma `$transaction`
- IN transactions increase stock
- OUT transactions decrease stock
- Strict validation to prevent negative stock (checked inside transaction)

### ✅ Analytics (PRO only)
- Total materials count
- Sum of all IN transactions
- Sum of all OUT transactions
- Current total stock across all materials

### ✅ Search & Filtering with Pagination
- **Case-insensitive search** for material names (uses raw SQL for SQLite compatibility)
- Filter materials by unit (exact match)
- Pagination support: `?page=1&limit=20` (max 100 per page)
- Returns total count and total pages

## 🆕 Key Implementation Features

### ✅ Input Validation with Zod
- **Robust request validation** using Zod schemas
- **Multi-level validation**: body, query, and params
- **Detailed error responses** with field-level messages
- **Automatic data transformation**: trim strings, parse numbers
- **Type safety**: Ensures data integrity before processing

**Example validation error**:
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "quantity",
      "message": "Quantity must be positive"
    }
  ]
}
```

### ✅ Environment Configuration
- Environment variables loaded via `dotenv`
- **Configurable**: PORT, DATABASE_URL, NODE_ENV
- **Centralized config** in `src/config/index.js`
- **Default values** for seamless development
- **Production-ready**: Easy migration to PostgreSQL/MySQL

### ✅ Logging System
- **Timestamped logger** with ISO 8601 format
- **Multiple levels**: info, error, warn, debug
- **Structured logging** with metadata
- **Request tracking**: Logs all API requests with tenant context
- **Debug mode**: Conditional debug logs in development

### ✅ Atomic Transactions for Data Consistency
- **FREE plan enforcement**: Uses Prisma `$transaction` to prevent race conditions
- **Material count and creation**: Atomic operations prevent limit bypass
- **Stock updates**: Transaction creation and stock modification in single transaction
- **Negative stock prevention**: Validates stock inside transaction before commit
- **Concurrent request safety**: Guarantees data integrity under load

### ✅ SQLite Case-Insensitive Search
- **Raw SQL implementation**: Uses `LOWER()` for case-insensitive name search
- **SQLite workaround**: Native `contains` is case-sensitive
- **Optimized queries**: Falls back to standard Prisma when name filter not used
- **Migration-ready**: Documented for future PostgreSQL transition
- **Performance**: Efficient pattern matching with proper indexing

**Implementation example**:
```javascript
const materials = await prisma.$queryRaw`
  SELECT * FROM Material 
  WHERE tenantId = ${tenantId} 
  AND deletedAt IS NULL 
  AND LOWER(name) LIKE ${searchPattern}
`;
```

## 🔧 Database Management

### View Database in Prisma Studio
```bash
npm run prisma:studio
```

### Create a New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

## 📊 Database Schema

The system uses 4 main models:

1. **Tenant**: Represents each organization/tenant with their plan
2. **User**: Tenant users with roles (ADMIN/USER)
3. **Material**: Inventory items with stock tracking and soft delete
4. **Transaction**: IN/OUT transactions for stock movements

All models are interconnected with foreign keys ensuring data integrity and cascade deletion.

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- IDs are generated using CUID for better security
- The system uses async/await throughout for clean asynchronous code
- Services layer handles all business logic
- Controllers are kept thin and focused on request/response handling

## 🧪 Testing

To test the API, you can use:

1. **cURL** (command line)
2. **Postman** (import the endpoints)
3. **VS Code REST Client** extension
4. **Thunder Client** VS Code extension

### Quick Test Sequence

```bash
# 1. Create a tenant
curl -X POST http://localhost:3000/tenants -H "Content-Type: application/json" -d '{"name":"Test Corp","plan":"PRO"}'

# 2. Create a material (replace TENANT_ID)
curl -X POST http://localhost:3000/materials -H "Content-Type: application/json" -H "x-tenant-id: TENANT_ID" -H "x-user-role: ADMIN" -d '{"name":"Cement","unit":"bags"}'

# 3. Add stock (replace TENANT_ID and MATERIAL_ID)
curl -X POST http://localhost:3000/materials/MATERIAL_ID/transactions -H "Content-Type: application/json" -H "x-tenant-id: TENANT_ID" -H "x-user-role: USER" -d '{"type":"IN","quantity":100}'

# 4. View analytics (PRO only)
curl -X GET http://localhost:3000/analytics/summary -H "x-tenant-id: TENANT_ID" -H "x-user-role: ADMIN"
```

## 🚀 Deployment

### Production Checklist

- [ ] Change `NODE_ENV=production` in `.env`
- [ ] Use PostgreSQL or MySQL instead of SQLite
- [ ] Enable HTTPS/TLS
- [ ] Add rate limiting middleware
- [ ] Implement proper JWT authentication
- [ ] Enable CORS with specific origins
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and set secure environment variables
- [ ] Enable Prisma connection pooling

### Database Migration to PostgreSQL

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## 🛡️ Security Considerations

- **No authentication**: This demo uses headers for simplicity. Implement JWT/OAuth in production.
- **Input validation**: All inputs validated with Zod schemas.
- **SQL injection**: Protected by Prisma's parameterized queries.
- **Tenant isolation**: Strict filtering by tenantId in all queries.
- **Soft delete**: Maintains data integrity and audit trail.
- **Rate limiting**: Not implemented - add in production.

## 🤝 Contributing

This is a demonstration project showcasing multi-tenant architecture patterns. Feel free to extend it with:
- **Authentication**: JWT tokens, OAuth2, Passport.js
- **User management**: Registration, login, password reset
- **Email notifications**: Transaction alerts, low stock warnings
- **File uploads**: Material images, documents
- **Export functionality**: CSV, Excel, PDF reports
- **Advanced reporting**: Charts, dashboards, trends
- **Audit logs**: Track all changes with timestamps
- **Webhooks**: Real-time notifications to external systems

## 📊 Performance Tips

- **Indexes**: Prisma schema includes indexes on `tenantId` and `deletedAt`
- **Connection pooling**: Configure in production Prisma client
- **Caching**: Consider Redis for frequently accessed data
- **Pagination**: Always use pagination for large datasets (already implemented)
- **Database**: PostgreSQL recommended for production scale

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

## 📞 Support

For questions or issues:
- Review the code comments for implementation details
- Check Prisma documentation: https://www.prisma.io/docs
- Review Express.js best practices: https://expressjs.com/
- Zod validation guide: https://zod.dev/

---

**Built with ❤️ using Node.js, Express.js, Prisma ORM, and Zod**

**Version**: 1.0.0  
**Last Updated**: December 10, 2025
