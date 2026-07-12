const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
} = require('../controllers/tripController');

const router = express.Router();

router.use(authenticate);

router.get('/', getTrips);

router.get('/:id', [param('id').isInt()], validate, getTripById);

router.post(
  '/',
  authorize('admin', 'manager', 'dispatcher'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('driverId').isInt().withMessage('driverId must be an integer'),
    body('source').trim().notEmpty().withMessage('Source is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('cargoWeightKg').isFloat({ min: 0 }).withMessage('cargoWeightKg must be non-negative'),
    body('plannedDistanceKm').isFloat({ min: 0 }).withMessage('plannedDistanceKm must be non-negative'),
  ],
  validate,
  createTrip
);

router.post(
  '/:id/dispatch',
  authorize('admin', 'manager', 'dispatcher'),
  [param('id').isInt()],
  validate,
  dispatchTrip
);

router.post(
  '/:id/complete',
  authorize('admin', 'manager', 'dispatcher'),
  [
    param('id').isInt(),
    body('finalOdometerKm').isFloat({ min: 0 }).withMessage('finalOdometerKm must be non-negative'),
    body('fuelConsumedLiters').isFloat({ min: 0 }).withMessage('fuelConsumedLiters must be non-negative'),
  ],
  validate,
  completeTrip
);

router.post(
  '/:id/cancel',
  authorize('admin', 'manager', 'dispatcher'),
  [param('id').isInt()],
  validate,
  cancelTrip
);

router.delete('/:id', authorize('admin', 'manager'), [param('id').isInt()], validate, deleteTrip);

module.exports = router;
