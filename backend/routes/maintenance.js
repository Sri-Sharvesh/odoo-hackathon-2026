const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRecords,
  getRecordById,
  createRecord,
  closeRecord,
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
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be non-negative'),
    body('scheduledDate').isISO8601().withMessage('scheduledDate must be a valid date'),
    body('notes').optional().trim(),
  ],
  validate,
  createRecord
);

router.post(
  '/:id/close',
  authorize('admin', 'manager'),
  [param('id').isInt()],
  validate,
  closeRecord
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteRecord);

module.exports = router;
