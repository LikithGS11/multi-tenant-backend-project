const express = require('express');
const { analyticsController } = require('../controllers');
const { tenantMiddleware, authMiddleware } = require('../middlewares');

const router = express.Router();

// Apply tenant and auth middleware to all analytics routes
router.use(tenantMiddleware);
router.use(authMiddleware);

/**
 * GET /analytics/summary
 * Get analytics summary
 * Requires: PRO plan
 */
router.get('/summary', analyticsController.getAnalyticsSummary);

module.exports = router;
