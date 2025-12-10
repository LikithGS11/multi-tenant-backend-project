const { z } = require('zod');

/**
 * Zod validation middleware factory
 * @param {Object} schemas - Object containing body, query, params schemas
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      const validated = {};

      // Validate body if schema provided
      if (schemas.body) {
        validated.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query if schema provided
      if (schemas.query) {
        validated.query = await schemas.query.parseAsync(req.query);
      }

      // Validate params if schema provided
      if (schemas.params) {
        validated.params = await schemas.params.parseAsync(req.params);
      }

      // Attach validated data to request
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      });
    }
  };
};

module.exports = validate;
