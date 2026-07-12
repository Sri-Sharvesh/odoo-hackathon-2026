const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { getLogs, getLogById, createLog, updateLog, deleteLog } = require('../controllers/fuelController');

const router = express.Router();

router.use(authenticate);

router.get('/', getLogs);

router.get('/:id', [param('id').isInt()], validate, getLogById);

router.post(
  '/',
  authorize('admin', 'manager', 'dispatcher'),
  [
    body('vehicle_id').isInt().withMessage('vehicle_id is required'),
    body('driver_id').optional().isInt(),
    body('log_date').isISO8601().withMessage('log_date must be a valid date'),
    body('liters').isFloat({ min: 0.01 }).withMessage('liters must be a positive number'),
    body('cost').isFloat({ min: 0 }).withMessage('cost must be a non-negative number'),
    body('odometer_reading').optional().isFloat({ min: 0 }),
  ],
  validate,
  createLog
);

router.put(
  '/:id',
  authorize('admin', 'manager', 'dispatcher'),
  [
    param('id').isInt(),
    body('liters').optional().isFloat({ min: 0.01 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('log_date').optional().isISO8601(),
  ],
  validate,
  updateLog
);

router.delete('/:id', authorize('admin', 'manager'), [param('id').isInt()], validate, deleteLog);

module.exports = router;
