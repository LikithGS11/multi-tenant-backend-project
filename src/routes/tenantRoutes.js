const express = require('express');
const { tenantController } = require('../controllers');

const router = express.Router();

/**
 * POST /tenants
 * Create a new tenant
 */
router.post('/', tenantController.createTenant);

/**
 * GET /tenants
 * Get all tenants (for testing/admin purposes)
 */
router.get('/', tenantController.getAllTenants);

module.exports = router;
