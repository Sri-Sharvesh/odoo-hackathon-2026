const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getDashboardSummary,
  getFleetUtilization,
  getFuelEfficiency,
  getMaintenanceCosts,
  getMonthlyTrend,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/fleet-utilization', getFleetUtilization);
router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/maintenance-costs', getMaintenanceCosts);
router.get('/monthly-trend', getMonthlyTrend);

module.exports = router;
