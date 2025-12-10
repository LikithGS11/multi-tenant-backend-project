const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

class TransactionService {
  /**
   * Create a transaction and update stock atomically
   * Prevents negative stock and ensures data consistency
   */
  async createTransaction(tenantId, materialId, data) {
    const { type, quantity } = data;

    if (!type || !quantity) {
      throw new Error('Transaction type and quantity are required');
    }

    if (!['IN', 'OUT'].includes(type)) {
      throw new Error('Transaction type must be either IN or OUT');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Use transaction to ensure atomicity and prevent negative stock
    const result = await prisma.$transaction(async (tx) => {
      // Load material with tenant verification inside transaction
      const material = await tx.material.findFirst({
        where: {
          id: materialId,
          tenantId,
          deletedAt: null
        }
      });

      if (!material) {
        throw new Error('Material not found or does not belong to this tenant');
      }

      // Calculate new stock
      const stockChange = type === 'IN' ? quantity : -quantity;
      const newStock = material.currentStock + stockChange;

      // Prevent negative stock
      if (newStock < 0) {
        throw new Error(`Insufficient stock. Current stock: ${material.currentStock}, requested: ${quantity}`);
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          materialId,
          type,
          quantity
        }
      });

      // Update material stock
      await tx.material.update({
        where: { id: materialId },
        data: {
          currentStock: newStock
        }
      });

      logger.info('Transaction created', { 
        tenantId, 
        materialId, 
        type, 
        quantity, 
        previousStock: material.currentStock,
        newStock 
      });

      return transaction;
    });

    return result;
  }

  /**
   * Get transactions for a material
   */
  async getTransactionsByMaterial(tenantId, materialId) {
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        materialId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return transactions;
  }
}

module.exports = new TransactionService();
