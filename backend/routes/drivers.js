const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  assignVehicle,
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
    body('license_number').trim().notEmpty().withMessage('License number is required'),
    body('license_expiry').optional().isISO8601().withMessage('license_expiry must be a valid date'),
    body('email').optional().isEmail(),
    body('status').optional().isIn(['available', 'on_trip', 'off_duty']),
  ],
  validate,
  createDriver
);

router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isInt(),
    body('license_expiry').optional().isISO8601(),
    body('email').optional().isEmail(),
    body('status').optional().isIn(['available', 'on_trip', 'off_duty']),
  ],
  validate,
  updateDriver
);

router.patch(
  '/:id/assign-vehicle',
  authorize('admin', 'manager', 'dispatcher'),
  [param('id').isInt(), body('vehicle_id').optional({ nullable: true }).isInt()],
  validate,
  assignVehicle
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteDriver);

module.exports = router;
