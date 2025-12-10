/**
 * RBAC Middleware
 * Role-Based Access Control - restricts access to specific roles
 */
const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.userRole;

      if (!userRole) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User role not found in request'
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Access denied',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  };
};

module.exports = rbacMiddleware;
