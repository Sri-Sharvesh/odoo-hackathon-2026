const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/vehicles
const getVehicles = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { status, type, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE orgId = ?';
  const params = [orgId];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    where += ' AND type = ?';
    params.push(type);
  }
  if (search) {
    where += ' AND (registrationNumber LIKE ? OR model LIKE ? OR type LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM vehicles ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM vehicles ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  // Map SQLite numeric/null keys to match frontend types perfectly
  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    registrationNumber: r.registrationNumber,
    model: r.model,
    type: r.type,
    maxLoadCapacityKg: Number(r.maxLoadCapacityKg),
    odometerKm: Number(r.odometerKm || 0),
    acquisitionCost: Number(r.acquisitionCost || 0),
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/vehicles/:id
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = db
    .prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?')
    .get(req.params.id, req.user.orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  res.json({
    id: String(vehicle.id),
    registrationNumber: vehicle.registrationNumber,
    model: vehicle.model,
    type: vehicle.type,
    maxLoadCapacityKg: Number(vehicle.maxLoadCapacityKg),
    odometerKm: Number(vehicle.odometerKm || 0),
    acquisitionCost: Number(vehicle.acquisitionCost || 0),
    status: vehicle.status,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt
  });
});

// POST /api/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { registrationNumber, model, type, maxLoadCapacityKg, odometerKm, acquisitionCost } = req.body;

  // Check for duplicate registrationNumber
  const existing = db.prepare('SELECT id FROM vehicles WHERE orgId = ? AND LOWER(registrationNumber) = LOWER(?)').get(orgId, registrationNumber);
  if (existing) {
    const err = new ApiError(409, 'Registration number already exists');
    err.errors = { registrationNumber: 'This registration number is already in use.' };
    throw err;
  }

  const result = db
    .prepare(
      `INSERT INTO vehicles (orgId, registrationNumber, model, type, maxLoadCapacityKg, odometerKm, acquisitionCost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`
    )
    .run(orgId, registrationNumber, model, type, maxLoadCapacityKg, odometerKm || 0, acquisitionCost || 0);

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
  
  res.status(201).json({
    id: String(vehicle.id),
    registrationNumber: vehicle.registrationNumber,
    model: vehicle.model,
    type: vehicle.type,
    maxLoadCapacityKg: Number(vehicle.maxLoadCapacityKg),
    odometerKm: Number(vehicle.odometerKm || 0),
    acquisitionCost: Number(vehicle.acquisitionCost || 0),
    status: vehicle.status,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt
  });
});

// PATCH /api/vehicles/:id
const updateVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const existing = db.prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!existing) throw new ApiError(404, 'Vehicle not found');

  const { registrationNumber, model, type, maxLoadCapacityKg, odometerKm, acquisitionCost, status } = req.body;

  if (registrationNumber && registrationNumber.toLowerCase() !== existing.registrationNumber.toLowerCase()) {
    const isDuplicate = db.prepare('SELECT id FROM vehicles WHERE orgId = ? AND id != ? AND LOWER(registrationNumber) = LOWER(?)').get(orgId, req.params.id, registrationNumber);
    if (isDuplicate) {
      const err = new ApiError(409, 'Registration number already exists');
      err.errors = { registrationNumber: 'This registration number is already in use.' };
      throw err;
    }
  }

  const fields = { registrationNumber, model, type, maxLoadCapacityKg, odometerKm, acquisitionCost, status };
  const updates = {};
  Object.keys(fields).forEach((f) => {
    if (fields[f] !== undefined) updates[f] = fields[f];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE vehicles SET ${setClause}, updatedAt = datetime('now') WHERE id = ? AND orgId = ?`)
    .run(...values, req.params.id, orgId);

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);

  res.json({
    id: String(vehicle.id),
    registrationNumber: vehicle.registrationNumber,
    model: vehicle.model,
    type: vehicle.type,
    maxLoadCapacityKg: Number(vehicle.maxLoadCapacityKg),
    odometerKm: Number(vehicle.odometerKm || 0),
    acquisitionCost: Number(vehicle.acquisitionCost || 0),
    status: vehicle.status,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt
  });
});

// DELETE /api/vehicles/:id
const deleteVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM vehicles WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Vehicle not found');
  res.status(200).json({ success: true });
});

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
