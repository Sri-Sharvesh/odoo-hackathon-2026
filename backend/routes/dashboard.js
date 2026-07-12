const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/analyticsController');

const router = express.Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);

module.exports = router;
