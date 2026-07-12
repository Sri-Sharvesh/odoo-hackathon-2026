const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

const router = express.Router();

router.use(authenticate);

router.get('/', getVehicles);

router.get('/:id', [param('id').isInt()], validate, getVehicleById);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('type').trim().notEmpty().withMessage('Vehicle type is required'),
    body('maxLoadCapacityKg').isInt({ min: 0 }).withMessage('maxLoadCapacityKg is required'),
    body('odometerKm').optional().isFloat({ min: 0 }),
    body('acquisitionCost').optional().isFloat({ min: 0 }),
  ],
  validate,
  createVehicle
);

router.patch(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isInt(),
    body('registrationNumber').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('type').optional().trim().notEmpty(),
    body('maxLoadCapacityKg').optional().isInt({ min: 0 }),
    body('odometerKm').optional().isFloat({ min: 0 }),
    body('acquisitionCost').optional().isFloat({ min: 0 }),
    body('status').optional().isString(),
  ],
  validate,
  updateVehicle
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteVehicle);

module.exports = router;
