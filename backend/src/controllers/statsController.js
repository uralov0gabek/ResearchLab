const statsService = require('../services/statsService');

/**
 * Controller to handle fetching dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const statsData = await statsService.getAggregatedStats();
    res.json(statsData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
