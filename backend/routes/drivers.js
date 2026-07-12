const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');

const router = express.Router();

router.use(authenticate);

router.get('/', getDrivers);

router.get('/:id', [param('id').isInt()], validate, getDriverById);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('licenseCategory').trim().notEmpty().withMessage('License category is required'),
    body('licenseExpiry').isISO8601().withMessage('licenseExpiry must be a valid date'),
    body('contactNumber').optional().trim().notEmpty(),
    body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  createDriver
);

router.patch(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('licenseNumber').optional().trim().notEmpty(),
    body('licenseCategory').optional().trim().notEmpty(),
    body('licenseExpiry').optional().isISO8601(),
    body('contactNumber').optional().trim(),
    body('safetyScore').optional().isFloat({ min: 0, max: 100 }),
    body('status').optional().isString(),
    body('assignedVehicleId').optional().custom((val) => val === null || typeof val === 'number' || typeof val === 'string'),
  ],
  validate,
  updateDriver
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteDriver);

module.exports = router;
