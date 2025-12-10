const { tenantService } = require('../services');

class TenantController {
  /**
   * Create a new tenant
   * POST /tenants
   */
  async createTenant(req, res) {
    try {
      const { name, plan } = req.body;

      const tenant = await tenantService.createTenant({ name, plan });

      return res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenant
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create tenant',
        message: error.message
      });
    }
  }

  /**
   * Get all tenants
   * GET /tenants
   */
  async getAllTenants(req, res) {
    try {
      const tenants = await tenantService.getAllTenants();

      return res.status(200).json({
        success: true,
        data: tenants
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tenants',
        message: error.message
      });
    }
  }
}

module.exports = new TenantController();
