# Multi-Tenant Material Inventory System

A production-ready Node.js backend system for managing material inventory with multi-tenant architecture, role-based access control, and plan-based feature restrictions.

## Features

- **Multi-tenant data isolation** – Complete separation of tenant data
- **Role-based access control (RBAC)** – ADMIN and USER roles with different permissions
- **Plan-based restrictions** – FREE plan (5 materials max) and PRO plan (unlimited + analytics)
- **Stock management** – Track IN/OUT transactions with atomic operations
- **Soft delete** – Materials marked as deleted instead of permanently removed
- **Analytics** – PRO plan users get inventory insights and reports
- **Search & filtering** – Case-insensitive search with pagination support
- **Input validation** – Zod schemas for request validation

## Tech Stack

- **Node.js** (v16+) with Express.js
- **Prisma ORM** (v5.7.0) with SQLite/PostgreSQL
- **Zod** (v3.22.4) for validation
- **dotenv** for environment management

## Multi-Tenant Architecture

This system enforces strict tenant-level data isolation:

- Every request requires an `x-tenant-id` header for tenant identification
- All database queries automatically filter by tenant ID
- Each tenant's data is completely isolated from others
- FREE plan tenants limited to 5 materials; PRO plan gets unlimited materials
- Analytics endpoints restricted to PRO plan only

## Project Structure

```
Multi-Tenant Backend Project/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd "Multi-Tenant Backend Project"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma client**:
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
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000` by default.

## API Usage

### Required Headers

All material, transaction, and analytics endpoints require:

```
x-tenant-id: <tenant_id>
x-user-role: ADMIN or USER
```

### Key Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/tenants` | Create new tenant | Public |
| POST | `/materials` | Create material | ADMIN |
| GET | `/materials` | List materials | All |
| GET | `/materials/:id` | Get material details | All |
| DELETE | `/materials/:id` | Soft delete material | ADMIN |
| POST | `/materials/:id/transactions` | Add IN/OUT transaction | All |
| GET | `/analytics/summary` | Get inventory analytics | PRO plan |

### Example Requests

**Create a tenant:**
```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "plan": "PRO"}'
```

**Create a material (ADMIN only):**
```bash
curl -X POST http://localhost:3000/materials \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: ADMIN" \
  -d '{"name": "Steel Rods", "unit": "kg"}'
```

**Search materials with pagination:**
```bash
curl -X GET "http://localhost:3000/materials?name=steel&page=1&limit=10" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: USER"
```

**Create an IN transaction:**
```bash
curl -X POST http://localhost:3000/materials/clxy5678efgh/transactions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: clxy1234abcd" \
  -H "x-user-role: USER" \
  -d '{"type": "IN", "quantity": 100}'
```

## Database Management

**View database in Prisma Studio:**
```bash
npm run prisma:studio
```

**Create new migration:**
```bash
npx prisma migrate dev --name migration_name
```

**Reset database:**
```bash
npx prisma migrate reset
```

## Production Deployment

For production use:

1. Switch to PostgreSQL or MySQL (update `DATABASE_URL` in `.env`)
2. Update Prisma schema provider to `postgresql` or `mysql`
3. Set `NODE_ENV=production`
4. Implement JWT authentication (currently uses headers for demo)
5. Enable CORS with specific origins
6. Add rate limiting middleware
7. Configure connection pooling

## Security Notes

- This demo uses simple headers for authentication. Implement JWT/OAuth2 in production.
- All inputs validated with Zod schemas
- SQL injection protected by Prisma's parameterized queries
- Tenant isolation enforced at database query level
---
