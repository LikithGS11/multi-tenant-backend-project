const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');
const { Prisma } = require('@prisma/client');

class MaterialService {
  /**
   * Create a new material with tenant isolation and plan limits
   * Uses Prisma transaction to prevent race conditions on FREE plan limit
   */
  async createMaterial(tenantId, plan, data) {
    const { name, unit, currentStock = 0 } = data;

    if (!name || !unit) {
      throw new Error('Material name and unit are required');
    }

    // Use transaction to safely enforce FREE plan limit
    const material = await prisma.$transaction(async (tx) => {
      // Count existing non-deleted materials for tenant
      const materialCount = await tx.material.count({
        where: {
          tenantId,
          deletedAt: null
        }
      });

      // FREE plan: max 5 materials
      if (plan === 'FREE' && materialCount >= 5) {
        throw new Error('FREE plan allows maximum 5 materials. Upgrade to PRO for unlimited materials.');
      }

      // Create material
      const newMaterial = await tx.material.create({
        data: {
          tenantId,
          name,
          unit,
          currentStock
        }
      });

      logger.info('Material created', { tenantId, materialId: newMaterial.id, name });
      return newMaterial;
    });

    return material;
  }

  /**
   * Get all materials for a tenant with filters and pagination
   * Uses raw query for case-insensitive search on SQLite
   */
  async getMaterials(tenantId, filters = {}) {
    const { name, unit, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

    // If name filter is provided, use raw query for case-insensitive search
    if (name) {
      const searchPattern = `%${name.toLowerCase()}%`;
      
      // Get materials with case-insensitive search
      const materials = await prisma.$queryRaw`
        SELECT * FROM Material 
        WHERE tenantId = ${tenantId} 
        AND deletedAt IS NULL 
        AND LOWER(name) LIKE ${searchPattern}
        ${unit ? Prisma.sql`AND unit = ${unit}` : Prisma.empty}
        ORDER BY createdAt DESC
        LIMIT ${take} OFFSET ${skip}
      `;

      // Get total count for pagination
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM Material 
        WHERE tenantId = ${tenantId} 
        AND deletedAt IS NULL 
        AND LOWER(name) LIKE ${searchPattern}
        ${unit ? Prisma.sql`AND unit = ${unit}` : Prisma.empty}
      `;

      const total = Number(countResult[0]?.count || 0);

      return {
        data: materials,
        pagination: {
          page,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      };
    }

    // Standard query without name filter
    const where = {
      tenantId,
      deletedAt: null
    };

    if (unit) {
      where.unit = unit;
    }

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.material.count({ where })
    ]);

    return {
      data: materials,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Get material by ID with transactions
   */
  async getMaterialById(tenantId, materialId) {
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        tenantId,
        deletedAt: null
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!material) {
      throw new Error('Material not found');
    }

    return material;
  }

  /**
   * Soft delete a material
   */
  async deleteMaterial(tenantId, materialId) {
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        tenantId,
        deletedAt: null
      }
    });

    if (!material) {
      throw new Error('Material not found');
    }

    const deletedMaterial = await prisma.material.update({
      where: { id: materialId },
      data: {
        deletedAt: new Date()
      }
    });

    return deletedMaterial;
  }

  /**
   * Update material stock
   */
  async updateStock(materialId, quantity) {
    const material = await prisma.material.update({
      where: { id: materialId },
      data: {
        currentStock: {
          increment: quantity
        }
      }
    });

    return material;
  }
}

module.exports = new MaterialService();
