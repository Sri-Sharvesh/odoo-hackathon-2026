const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTrips,
  getTripById,
  createTrip,
  updateTripStatus,
  updateTrip,
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
    body('vehicle_id').isInt().withMessage('vehicle_id is required'),
    body('driver_id').isInt().withMessage('driver_id is required'),
    body('origin').trim().notEmpty().withMessage('Origin is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('scheduled_start').isISO8601().withMessage('scheduled_start must be a valid date/time'),
    body('scheduled_end').optional().isISO8601(),
    body('distance_km').optional().isFloat({ min: 0 }),
  ],
  validate,
  createTrip
);

router.put(
  '/:id',
  authorize('admin', 'manager', 'dispatcher'),
  [
    param('id').isInt(),
    body('scheduled_start').optional().isISO8601(),
    body('scheduled_end').optional().isISO8601(),
    body('distance_km').optional().isFloat({ min: 0 }),
  ],
  validate,
  updateTrip
);

router.patch(
  '/:id/status',
  authorize('admin', 'manager', 'dispatcher'),
  [
    param('id').isInt(),
    body('status').isIn(['in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  ],
  validate,
  updateTripStatus
);

router.delete('/:id', authorize('admin', 'manager'), [param('id').isInt()], validate, deleteTrip);

module.exports = router;
