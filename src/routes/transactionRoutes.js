const express = require('express');
const { transactionController } = require('../controllers');
const { tenantMiddleware, authMiddleware } = require('../middlewares');
const validate = require('../middlewares/validate');
const { createTransactionSchema } = require('../middlewares/schemas');

const router = express.Router();

// Apply tenant and auth middleware to all transaction routes
router.use(tenantMiddleware);
router.use(authMiddleware);

/**
 * POST /materials/:id/transactions
 * Create a transaction for a material
 * Available to: ADMIN, USER
 */
router.post('/', 
  validate(createTransactionSchema), 
  transactionController.createTransaction
);

module.exports = router;
