const express = require('express');
const { materialController } = require('../controllers');
const { tenantMiddleware, authMiddleware, rbacMiddleware } = require('../middlewares');
const validate = require('../middlewares/validate');
const { createMaterialSchema, getMaterialsSchema } = require('../middlewares/schemas');

const router = express.Router();

// Apply tenant and auth middleware to all material routes
router.use(tenantMiddleware);
router.use(authMiddleware);

/**
 * POST /materials
 * Create a new material
 * Requires: ADMIN role
 */
router.post('/', 
  rbacMiddleware(['ADMIN']), 
  validate(createMaterialSchema), 
  materialController.createMaterial
);

/**
 * GET /materials
 * Get all materials with optional filters and pagination
 * Available to: ADMIN, USER
 */
router.get('/', 
  validate(getMaterialsSchema), 
  materialController.getMaterials
);

/**
 * GET /materials/:id
 * Get material by ID with transactions
 * Available to: ADMIN, USER
 */
router.get('/:id', materialController.getMaterialById);

/**
 * DELETE /materials/:id
 * Soft delete a material
 * Requires: ADMIN role
 */
router.delete('/:id', rbacMiddleware(['ADMIN']), materialController.deleteMaterial);

module.exports = router;
