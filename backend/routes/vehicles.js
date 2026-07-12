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
    body('registration_no').trim().notEmpty().withMessage('Registration number is required'),
    body('type').trim().notEmpty().withMessage('Vehicle type is required'),
    body('year').optional().isInt({ min: 1950, max: 2100 }),
    body('capacity').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['active', 'maintenance', 'inactive']),
  ],
  validate,
  createVehicle
);

router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isInt(),
    body('status').optional().isIn(['active', 'maintenance', 'inactive']),
    body('year').optional().isInt({ min: 1950, max: 2100 }),
    body('capacity').optional().isInt({ min: 0 }),
  ],
  validate,
  updateVehicle
);

router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, deleteVehicle);

module.exports = router;
