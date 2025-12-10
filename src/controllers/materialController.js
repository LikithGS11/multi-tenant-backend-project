const { materialService } = require('../services');
const logger = require('../utils/logger');

class MaterialController {
  /**
   * Create a new material
   * POST /materials
   * Requires: ADMIN role
   */
  async createMaterial(req, res) {
    try {
      // Use validated data from middleware
      const { name, unit, currentStock } = req.validated?.body || req.body;
      const tenantId = req.tenant.id;
      const plan = req.tenant.plan;

      const material = await materialService.createMaterial(
        tenantId,
        plan,
        { name, unit, currentStock }
      );

      return res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: material
      });
    } catch (error) {
      logger.error('Failed to create material', { error: error.message, tenantId: req.tenant?.id });
      return res.status(400).json({
        success: false,
        error: 'Failed to create material',
        message: error.message
      });
    }
  }

  /**
   * Get all materials with optional filters and pagination
   * GET /materials?name=xyz&unit=kg&page=1&limit=20
   */
  async getMaterials(req, res) {
    try {
      const tenantId = req.tenant.id;
      // Use validated query params
      const filters = req.validated?.query || {
        name: req.query.name,
        unit: req.query.unit,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await materialService.getMaterials(tenantId, filters);

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Failed to fetch materials', { error: error.message, tenantId: req.tenant?.id });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch materials',
        message: error.message
      });
    }
  }

  /**
   * Get material by ID with transactions
   * GET /materials/:id
   */
  async getMaterialById(req, res) {
    try {
      const tenantId = req.tenant.id;
      const materialId = req.params.id;

      const material = await materialService.getMaterialById(tenantId, materialId);

      return res.status(200).json({
        success: true,
        data: material
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Material not found',
        message: error.message
      });
    }
  }

  /**
   * Soft delete a material
   * DELETE /materials/:id
   */
  async deleteMaterial(req, res) {
    try {
      const tenantId = req.tenant.id;
      const materialId = req.params.id;

      const material = await materialService.deleteMaterial(tenantId, materialId);

      return res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
        data: material
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Failed to delete material',
        message: error.message
      });
    }
  }
}

module.exports = new MaterialController();
