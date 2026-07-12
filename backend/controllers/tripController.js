const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/trips
const getTrips = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { status, vehicleId, driverId, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE t.orgId = ?';
  const params = [orgId];

  if (status) {
    where += ' AND t.status = ?';
    params.push(status);
  }
  if (vehicleId) {
    where += ' AND t.vehicleId = ?';
    params.push(vehicleId);
  }
  if (driverId) {
    where += ' AND t.driverId = ?';
    params.push(driverId);
  }
  if (search) {
    where += ' AND (t.source LIKE ? OR t.destination LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM trips t ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT t.* FROM trips t ${where} ORDER BY t.createdAt DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    orgId: String(r.orgId),
    vehicleId: String(r.vehicleId),
    driverId: String(r.driverId),
    source: r.source,
    destination: r.destination,
    cargoWeightKg: Number(r.cargoWeightKg || 0),
    plannedDistanceKm: Number(r.plannedDistanceKm || 0),
    status: r.status,
    finalOdometerKm: r.finalOdometerKm !== null ? Number(r.finalOdometerKm) : undefined,
    fuelConsumedLiters: r.fuelConsumedLiters !== null ? Number(r.fuelConsumedLiters) : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/trips/:id
const getTripById = asyncHandler(async (req, res) => {
  const trip = db.prepare(`SELECT * FROM trips WHERE id = ? AND orgId = ?`).get(req.params.id, req.user.orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  res.json({
    id: String(trip.id),
    orgId: String(trip.orgId),
    vehicleId: String(trip.vehicleId),
    driverId: String(trip.driverId),
    source: trip.source,
    destination: trip.destination,
    cargoWeightKg: Number(trip.cargoWeightKg || 0),
    plannedDistanceKm: Number(trip.plannedDistanceKm || 0),
    status: trip.status,
    finalOdometerKm: trip.finalOdometerKm !== null ? Number(trip.finalOdometerKm) : undefined,
    fuelConsumedLiters: trip.fuelConsumedLiters !== null ? Number(trip.fuelConsumedLiters) : undefined,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  });
});

// POST /api/trips
const createTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, driverId, source, destination, cargoWeightKg, plannedDistanceKm } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?').get(vehicleId, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND orgId = ?').get(driverId, orgId);
  if (!driver) throw new ApiError(404, 'Driver not found');

  if (vehicle.status !== 'available') {
    const err = new ApiError(409, 'Vehicle is not available');
    err.errors = { vehicleId: 'This vehicle is no longer available.' };
    throw err;
  }

  // Check if driver is available (safety score is also verified on frontend, but we just check status here)
  if (driver.status !== 'available') {
    const err = new ApiError(409, 'Driver is not available');
    err.errors = { driverId: 'This driver is no longer available.' };
    throw err;
  }

  // Check cargo weight against vehicle max capacity
  if (cargoWeightKg > vehicle.maxLoadCapacityKg) {
    const err = new ApiError(422, 'Cargo exceeds vehicle capacity');
    err.errors = { cargoWeightKg: `Cannot exceed ${vehicle.maxLoadCapacityKg} kg for this vehicle.` };
    throw err;
  }

  const result = db
    .prepare(
      `INSERT INTO trips (orgId, vehicleId, driverId, source, destination, cargoWeightKg, plannedDistanceKm, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`
    )
    .run(orgId, vehicleId, driverId, source, destination, cargoWeightKg || 0, plannedDistanceKm || 0);

  const tripId = result.lastInsertRowid;
  const trip = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(tripId);

  res.status(201).json({
    id: String(trip.id),
    orgId: String(trip.orgId),
    vehicleId: String(trip.vehicleId),
    driverId: String(trip.driverId),
    source: trip.source,
    destination: trip.destination,
    cargoWeightKg: Number(trip.cargoWeightKg || 0),
    plannedDistanceKm: Number(trip.plannedDistanceKm || 0),
    status: trip.status,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt
  });
});

// POST /api/trips/:id/dispatch
const dispatchTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (trip.status !== 'draft') {
    throw new ApiError(409, 'Only draft trips can be dispatched');
  }

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(trip.vehicleId);
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(trip.driverId);

  if (vehicle.status !== 'available' || driver.status !== 'available') {
    throw new ApiError(409, 'Vehicle or driver is no longer available');
  }

  db.transaction(() => {
    db.prepare("UPDATE trips SET status = 'dispatched', updatedAt = datetime('now') WHERE id = ?").run(trip.id);
    db.prepare("UPDATE vehicles SET status = 'on_trip', updatedAt = datetime('now') WHERE id = ?").run(trip.vehicleId);
    db.prepare("UPDATE drivers SET status = 'on_trip', updatedAt = datetime('now') WHERE id = ?").run(trip.driverId);
  })();

  const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(trip.id);

  res.json({
    id: String(updated.id),
    orgId: String(updated.orgId),
    vehicleId: String(updated.vehicleId),
    driverId: String(updated.driverId),
    source: updated.source,
    destination: updated.destination,
    cargoWeightKg: Number(updated.cargoWeightKg || 0),
    plannedDistanceKm: Number(updated.plannedDistanceKm || 0),
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// POST /api/trips/:id/complete
const completeTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { finalOdometerKm, fuelConsumedLiters } = req.body;

  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (trip.status !== 'dispatched') {
    throw new ApiError(409, 'Only dispatched trips can be completed');
  }

  db.transaction(() => {
    db.prepare(`
      UPDATE trips
      SET status = 'completed', finalOdometerKm = ?, fuelConsumedLiters = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(finalOdometerKm, fuelConsumedLiters, trip.id);

    db.prepare(`
      UPDATE vehicles
      SET status = 'available', odometerKm = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(finalOdometerKm, trip.vehicleId);

    db.prepare(`
      UPDATE drivers
      SET status = 'available', updatedAt = datetime('now')
      WHERE id = ?
    `).run(trip.driverId);
  })();

  const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(trip.id);

  res.json({
    id: String(updated.id),
    orgId: String(updated.orgId),
    vehicleId: String(updated.vehicleId),
    driverId: String(updated.driverId),
    source: updated.source,
    destination: updated.destination,
    cargoWeightKg: Number(updated.cargoWeightKg || 0),
    plannedDistanceKm: Number(updated.plannedDistanceKm || 0),
    status: updated.status,
    finalOdometerKm: Number(updated.finalOdometerKm),
    fuelConsumedLiters: Number(updated.fuelConsumedLiters),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// POST /api/trips/:id/cancel
const cancelTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (trip.status !== 'draft' && trip.status !== 'dispatched') {
    throw new ApiError(409, 'Only draft or dispatched trips can be cancelled');
  }

  db.transaction(() => {
    db.prepare("UPDATE trips SET status = 'cancelled', updatedAt = datetime('now') WHERE id = ?").run(trip.id);
    
    if (trip.status === 'dispatched') {
      db.prepare("UPDATE vehicles SET status = 'available', updatedAt = datetime('now') WHERE id = ?").run(trip.vehicleId);
      db.prepare("UPDATE drivers SET status = 'available', updatedAt = datetime('now') WHERE id = ?").run(trip.driverId);
    }
  })();

  const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(trip.id);

  res.json({
    id: String(updated.id),
    orgId: String(updated.orgId),
    vehicleId: String(updated.vehicleId),
    driverId: String(updated.driverId),
    source: updated.source,
    destination: updated.destination,
    cargoWeightKg: Number(updated.cargoWeightKg || 0),
    plannedDistanceKm: Number(updated.plannedDistanceKm || 0),
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// DELETE /api/trips/:id
const deleteTrip = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM trips WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Trip not found');
  res.status(200).json({ success: true });
});

module.exports = { getTrips, getTripById, createTrip, dispatchTrip, completeTrip, cancelTrip, deleteTrip };
