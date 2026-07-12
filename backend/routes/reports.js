const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getVehicleReports } = require('../controllers/analyticsController');

const router = express.Router();

router.use(authenticate);

router.get('/vehicles', getVehicleReports);

module.exports = router;
