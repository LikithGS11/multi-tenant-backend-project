const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const {
  tenantRoutes,
  materialRoutes,
  transactionRoutes,
  analyticsRoutes
} = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    query: req.query,
    tenantId: req.headers['x-tenant-id'] 
  });
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Multi-Tenant Material Inventory API',
    version: '1.0.0',
    status: 'running',
    environment: config.nodeEnv
  });
});

// Routes
app.use('/tenants', tenantRoutes);
app.use('/materials', materialRoutes);
app.use('/materials/:id/transactions', transactionRoutes);
app.use('/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  logger.warn('404 Not Found', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});

app.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API available at http://localhost:${config.port}`);
});

module.exports = app;
