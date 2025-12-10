const { transactionService } = require('../services');
const logger = require('../utils/logger');

class TransactionController {
  /**
   * Create a transaction for a material
   * POST /materials/:id/transactions
   */
  async createTransaction(req, res) {
    try {
      const tenantId = req.tenant.id;
      const materialId = req.params.id;
      // Use validated data
      const { type, quantity } = req.validated?.body || req.body;

      const transaction = await transactionService.createTransaction(
        tenantId,
        materialId,
        { type, quantity }
      );

      return res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      logger.error('Failed to create transaction', { 
        error: error.message, 
        tenantId: req.tenant?.id,
        materialId: req.params.id 
      });
      return res.status(400).json({
        success: false,
        error: 'Failed to create transaction',
        message: error.message
      });
    }
  }
}

module.exports = new TransactionController();
