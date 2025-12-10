const prisma = require('../utils/prismaClient');
const logger = require('../utils/logger');

class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(data) {
    const { name, plan = 'FREE' } = data;

    if (!name) {
      throw new Error('Tenant name is required');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        plan
      }
    });

    logger.info('Tenant created', { tenantId: tenant.id, name, plan });
    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    return tenant;
  }

  /**
   * Get all tenants
   */
  async getAllTenants() {
    const tenants = await prisma.tenant.findMany();
    return tenants;
  }
}

module.exports = new TenantService();
