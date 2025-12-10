const prisma = require('../utils/prismaClient');

/**
 * Tenant Middleware
 * Validates tenant existence and attaches tenant to request
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      return res.status(400).json({
        error: 'Tenant ID is required',
        message: 'Please provide x-tenant-id header'
      });
    }

    // Fetch tenant from database
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Invalid tenant ID'
      });
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

module.exports = tenantMiddleware;
