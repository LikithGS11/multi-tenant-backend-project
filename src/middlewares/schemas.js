const { z } = require('zod');

// Material creation schema
const createMaterialSchema = {
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name must not exceed 200 characters')
      .transform(val => val.trim()),
    unit: z.string()
      .min(1, 'Unit is required')
      .max(30, 'Unit must not exceed 30 characters')
      .transform(val => val.trim()),
    currentStock: z.number()
      .int('Stock must be an integer')
      .nonnegative('Stock cannot be negative')
      .optional()
  })
};

// Material query filters schema
const getMaterialsSchema = {
  query: z.object({
    name: z.string().optional(),
    unit: z.string().optional(),
    page: z.string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .default('1'),
    limit: z.string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().int().positive().max(100))
      .optional()
      .default('20')
  })
};

// Transaction creation schema
const createTransactionSchema = {
  body: z.object({
    type: z.enum(['IN', 'OUT'], {
      errorMap: () => ({ message: 'Type must be either IN or OUT' })
    }),
    quantity: z.number()
      .int('Quantity must be an integer')
      .positive('Quantity must be positive')
  })
};

module.exports = {
  createMaterialSchema,
  getMaterialsSchema,
  createTransactionSchema
};
