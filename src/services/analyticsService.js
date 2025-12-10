const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get analytics summary for PRO tenants
   */
  async getAnalyticsSummary(tenantId, plan) {
    // Only PRO tenants can access analytics
    if (plan !== 'PRO') {
      logger.warn('Analytics access denied', { tenantId, plan });
      throw new Error('Analytics is only available for PRO plan. Please upgrade your plan.');
    }

    // Get materials count (excluding soft-deleted)
    const materialsCount = await prisma.material.count({
      where: {
        tenantId,
        deletedAt: null
      }
    });

    // Get total IN transactions
    const totalIn = await prisma.transaction.aggregate({
      where: {
        tenantId,
        type: 'IN'
      },
      _sum: {
        quantity: true
      }
    });

    // Get total OUT transactions
    const totalOut = await prisma.transaction.aggregate({
      where: {
        tenantId,
        type: 'OUT'
      },
      _sum: {
        quantity: true
      }
    });

    // Get total current stock
    const totalStock = await prisma.material.aggregate({
      where: {
        tenantId,
        deletedAt: null
      },
      _sum: {
        currentStock: true
      }
    });

    return {
      materials_count: materialsCount,
      total_in: totalIn._sum.quantity || 0,
      total_out: totalOut._sum.quantity || 0,
      total_stock: totalStock._sum.currentStock || 0
    };
  }
}

module.exports = new AnalyticsService();
