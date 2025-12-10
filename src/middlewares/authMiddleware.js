/**
 * Auth Middleware
 * Extracts user role from header and attaches to request
 */
const authMiddleware = (req, res, next) => {
  try {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide x-user-role header'
      });
    }

    const validRoles = ['ADMIN', 'USER'];
    if (!validRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Invalid role',
        message: 'Role must be either ADMIN or USER'
      });
    }

    // Attach role to request
    req.userRole = userRole;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

module.exports = authMiddleware;
