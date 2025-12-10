const { analyticsService } = require('../services');

class AnalyticsController {
  /**
   * Get analytics summary
   * GET /analytics/summary
   * Requires: PRO plan
   */
  async getAnalyticsSummary(req, res) {
    try {
      const tenantId = req.tenant.id;
      const plan = req.tenant.plan;

      const summary = await analyticsService.getAnalyticsSummary(tenantId, plan);

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();
