const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const TRIP_SELECT = `
  SELECT t.*, v.registration_no AS vehicle_registration, d.name AS driver_name
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN drivers d ON d.id = t.driver_id
`;

// GET /api/trips?status=&vehicle_id=&driver_id=
const getTrips = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { status, vehicle_id, driver_id } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE t.org_id = ?';
  const params = [orgId];

  if (status) {
    where += ' AND t.status = ?';
    params.push(status);
  }
  if (vehicle_id) {
    where += ' AND t.vehicle_id = ?';
    params.push(vehicle_id);
  }
  if (driver_id) {
    where += ' AND t.driver_id = ?';
    params.push(driver_id);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM trips t ${where}`).get(...params).count;
  const rows = db
    .prepare(`${TRIP_SELECT} ${where} ORDER BY t.scheduled_start DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getTripById = asyncHandler(async (req, res) => {
  const trip = db.prepare(`${TRIP_SELECT} WHERE t.id = ? AND t.org_id = ?`).get(req.params.id, req.user.org_id);
  if (!trip) throw new ApiError(404, 'Trip not found');
  res.json({ success: true, data: trip });
});

// POST /api/trips  -- dispatch a new trip; validates vehicle & driver availability
const createTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, distance_km, notes } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?').get(vehicle_id, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status !== 'active') throw new ApiError(400, `Vehicle is not active (current status: ${vehicle.status})`);

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND org_id = ?').get(driver_id, orgId);
  if (!driver) throw new ApiError(404, 'Driver not found');
  if (driver.status !== 'available') throw new ApiError(400, `Driver is not available (current status: ${driver.status})`);

  const insertTrip = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO trips (org_id, vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, distance_km, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`
      )
      .run(orgId, vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end || null, distance_km || null, notes || null);

    db.prepare(`UPDATE drivers SET status = 'on_trip', updated_at = datetime('now') WHERE id = ?`).run(driver_id);
    return result.lastInsertRowid;
  });

  const tripId = insertTrip();
  const trip = db.prepare(`${TRIP_SELECT} WHERE t.id = ?`).get(tripId);
  res.status(201).json({ success: true, data: trip });
});

// PATCH /api/trips/:id/status  { status, actual_start?, actual_end? }
const updateTripStatus = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { status } = req.body;

  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  const validTransitions = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };
  if (!validTransitions[trip.status].includes(status)) {
    throw new ApiError(400, `Cannot transition trip from '${trip.status}' to '${status}'`);
  }

  const apply = db.transaction(() => {
    if (status === 'in_progress') {
      db.prepare(`UPDATE trips SET status = ?, actual_start = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
        .run(status, trip.id);
    } else if (status === 'completed') {
      db.prepare(`UPDATE trips SET status = ?, actual_end = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
        .run(status, trip.id);
      db.prepare(`UPDATE drivers SET status = 'available', updated_at = datetime('now') WHERE id = ?`).run(trip.driver_id);
    } else if (status === 'cancelled') {
      db.prepare(`UPDATE trips SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, trip.id);
      db.prepare(`UPDATE drivers SET status = 'available', updated_at = datetime('now') WHERE id = ?`).run(trip.driver_id);
    }
  });
  apply();

  const updated = db.prepare(`${TRIP_SELECT} WHERE t.id = ?`).get(trip.id);
  res.json({ success: true, data: updated });
});

// PUT /api/trips/:id -- edit trip details (only while scheduled)
const updateTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'scheduled') throw new ApiError(400, 'Only scheduled trips can be edited');

  const fields = ['origin', 'destination', 'scheduled_start', 'scheduled_end', 'distance_km', 'notes'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE trips SET ${setClause}, updated_at = datetime('now') WHERE id = ?`).run(...values, trip.id);

  const updated = db.prepare(`${TRIP_SELECT} WHERE t.id = ?`).get(trip.id);
  res.json({ success: true, data: updated });
});

const deleteTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status === 'in_progress') throw new ApiError(400, 'Cannot delete a trip that is in progress');

  db.prepare('DELETE FROM trips WHERE id = ?').run(trip.id);
  res.json({ success: true, message: 'Trip deleted successfully' });
});

module.exports = { getTrips, getTripById, createTrip, updateTripStatus, updateTrip, deleteTrip };
