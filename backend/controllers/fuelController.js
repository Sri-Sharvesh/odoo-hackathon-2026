const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/fuel-logs
const getLogs = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE orgId = ?';
  const params = [orgId];
  if (vehicleId) {
    where += ' AND vehicleId = ?';
    params.push(vehicleId);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM fuel_logs ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM fuel_logs ${where} ORDER BY date DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    vehicleId: String(r.vehicleId),
    liters: Number(r.liters),
    cost: Number(r.cost),
    date: r.date,
    notes: r.notes || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/fuel-logs/:id
const getLogById = asyncHandler(async (req, res) => {
  const log = db.prepare('SELECT * FROM fuel_logs WHERE id = ? AND orgId = ?').get(req.params.id, req.user.orgId);
  if (!log) throw new ApiError(404, 'Fuel log not found');

  res.json({
    id: String(log.id),
    vehicleId: String(log.vehicleId),
    liters: Number(log.liters),
    cost: Number(log.cost),
    date: log.date,
    notes: log.notes || '',
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  });
});

// POST /api/fuel-logs
const createLog = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, liters, cost, date, notes } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?').get(vehicleId, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const result = db
    .prepare(
      `INSERT INTO fuel_logs (orgId, vehicleId, liters, cost, date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(orgId, vehicleId, liters, cost, date, notes || null);

  const log = db.prepare('SELECT * FROM fuel_logs WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    id: String(log.id),
    vehicleId: String(log.vehicleId),
    liters: Number(log.liters),
    cost: Number(log.cost),
    date: log.date,
    notes: log.notes || '',
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  });
});

// PATCH /api/fuel-logs/:id
const updateLog = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const log = db.prepare('SELECT * FROM fuel_logs WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!log) throw new ApiError(404, 'Fuel log not found');

  const { vehicleId, liters, cost, date, notes } = req.body;
  const fields = { vehicleId, liters, cost, date, notes };
  const updates = {};
  Object.keys(fields).forEach((f) => {
    if (fields[f] !== undefined) updates[f] = fields[f];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE fuel_logs SET ${setClause}, updatedAt = datetime('now') WHERE id = ? AND orgId = ?`)
    .run(...values, req.params.id, orgId);

  const updated = db.prepare('SELECT * FROM fuel_logs WHERE id = ?').get(req.params.id);

  res.json({
    id: String(updated.id),
    vehicleId: String(updated.vehicleId),
    liters: Number(updated.liters),
    cost: Number(updated.cost),
    date: updated.date,
    notes: updated.notes || '',
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// DELETE /api/fuel-logs/:id
const deleteLog = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM fuel_logs WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Fuel log not found');
  res.status(200).json({ success: true });
});

module.exports = { getLogs, getLogById, createLog, updateLog, deleteLog };
