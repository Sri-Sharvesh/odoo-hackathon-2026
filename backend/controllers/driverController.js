const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getDrivers = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { status, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE d.org_id = ?';
  const params = [orgId];

  if (status) {
    where += ' AND d.status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (d.name LIKE ? OR d.license_number LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM drivers d ${where}`).get(...params).count;
  const rows = db
    .prepare(
      `SELECT d.*, v.registration_no AS assigned_vehicle_reg
       FROM drivers d
       LEFT JOIN vehicles v ON v.id = d.assigned_vehicle_id
       ${where} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getDriverById = asyncHandler(async (req, res) => {
  const driver = db
    .prepare('SELECT * FROM drivers WHERE id = ? AND org_id = ?')
    .get(req.params.id, req.user.org_id);
  if (!driver) throw new ApiError(404, 'Driver not found');
  res.json({ success: true, data: driver });
});

const createDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { name, license_number, license_expiry, phone, email, status } = req.body;

  const result = db
    .prepare(
      `INSERT INTO drivers (org_id, name, license_number, license_expiry, phone, email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(orgId, name, license_number, license_expiry || null, phone || null, email || null, status || 'available');

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: driver });
});

const updateDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const existing = db.prepare('SELECT * FROM drivers WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!existing) throw new ApiError(404, 'Driver not found');

  const fields = ['name', 'license_number', 'license_expiry', 'phone', 'email', 'status'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE drivers SET ${setClause}, updated_at = datetime('now') WHERE id = ? AND org_id = ?`)
    .run(...values, req.params.id, orgId);

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: driver });
});

// PATCH /api/drivers/:id/assign-vehicle  { vehicle_id }
const assignVehicle = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id } = req.body;

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!driver) throw new ApiError(404, 'Driver not found');

  if (vehicle_id !== null && vehicle_id !== undefined) {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?').get(vehicle_id, orgId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  }

  db.prepare(`UPDATE drivers SET assigned_vehicle_id = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(vehicle_id ?? null, req.params.id);

  const updated = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updated });
});

const deleteDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const result = db.prepare('DELETE FROM drivers WHERE id = ? AND org_id = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Driver not found');
  res.json({ success: true, message: 'Driver deleted successfully' });
});

module.exports = { getDrivers, getDriverById, createDriver, updateDriver, assignVehicle, deleteDriver };
