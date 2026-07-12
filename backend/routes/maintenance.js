const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRecords,
  getRecordById,
  createRecord,
  updateRecordStatus,
  updateRecord,
  deleteRecord,
} = require('../controllers/maintenanceController');

const router = express.Router();

router.use(authenticate);

router.get('/', getRecords);

router.get('/:id', [param('id').isInt()], validate, getRecordById);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('vehicle_id').isInt().withMessage('vehicle_id is required'),
    body('type').isIn(['service', 'repair', 'inspection']).withMessage('type must be service, repair, or inspection'),
    body('service_date').isISO8601().withMessage('service_date must be a valid date'),
    body('next_due_date').optional().isISO8601(),
    body('cost').optional().isFloat({ min: 0 }),
    body('odometer_reading').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed']),
  ],
  validate,
  createRecord
);

router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isInt(),
    body('service_date').optional().isISO8601(),
    body('next_due_date').optional().isISO8601(),
    body('cost').optional().isFloat({ min: 0 }),
  ],
  validate,
  updateRecord
);

router.patch(
  '/:id/status',
  authorize('admin', 'manager'),
  [param('id').isInt(), body('status').isIn(['scheduled', 'in_progress', 'completed']).withMessage('Invalid status')],
  validate,
  updateRecordStatus
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteRecord);

module.exports = router;
