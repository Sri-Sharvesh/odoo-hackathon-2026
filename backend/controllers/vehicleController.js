const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/vehicles?status=&type=&page=&limit=
const getVehicles = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { status, type, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE org_id = ?';
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
    where += ' AND (registration_no LIKE ? OR make LIKE ? OR model LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM vehicles ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM vehicles ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/vehicles/:id
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = db
    .prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?')
    .get(req.params.id, req.user.org_id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  res.json({ success: true, data: vehicle });
});

// POST /api/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { registration_no, type, make, model, year, capacity, odometer, status } = req.body;

  const result = db
    .prepare(
      `INSERT INTO vehicles (org_id, registration_no, type, make, model, year, capacity, odometer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(orgId, registration_no, type, make || null, model || null, year || null, capacity || null, odometer || 0, status || 'active');

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: vehicle });
});

// PUT /api/vehicles/:id
const updateVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const existing = db.prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!existing) throw new ApiError(404, 'Vehicle not found');

  const fields = ['registration_no', 'type', 'make', 'model', 'year', 'capacity', 'odometer', 'status'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE vehicles SET ${setClause}, updated_at = datetime('now') WHERE id = ? AND org_id = ?`)
    .run(...values, req.params.id, orgId);

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: vehicle });
});

// DELETE /api/vehicles/:id
const deleteVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const result = db.prepare('DELETE FROM vehicles WHERE id = ? AND org_id = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Vehicle not found');
  res.json({ success: true, message: 'Vehicle deleted successfully' });
});

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
