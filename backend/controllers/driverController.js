const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/drivers
const getDrivers = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { status, category, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE orgId = ?';
  const params = [orgId];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    where += ' AND licenseCategory = ?';
    params.push(category);
  }
  if (search) {
    where += ' AND (name LIKE ? OR licenseNumber LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM drivers ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM drivers ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    licenseNumber: r.licenseNumber,
    licenseCategory: r.licenseCategory,
    licenseExpiry: r.licenseExpiry,
    contactNumber: r.contactNumber || '',
    safetyScore: Number(r.safetyScore || 0),
    status: r.status,
    assignedVehicleId: r.assignedVehicleId ? String(r.assignedVehicleId) : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/drivers/:id
const getDriverById = asyncHandler(async (req, res) => {
  const driver = db
    .prepare('SELECT * FROM drivers WHERE id = ? AND orgId = ?')
    .get(req.params.id, req.user.orgId);
  if (!driver) throw new ApiError(404, 'Driver not found');

  res.json({
    id: String(driver.id),
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiry: driver.licenseExpiry,
    contactNumber: driver.contactNumber || '',
    safetyScore: Number(driver.safetyScore || 0),
    status: driver.status,
    assignedVehicleId: driver.assignedVehicleId ? String(driver.assignedVehicleId) : null,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt
  });
});

// POST /api/drivers
const createDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore } = req.body;

  // Check for duplicate licenseNumber
  const existing = db.prepare('SELECT id FROM drivers WHERE orgId = ? AND LOWER(licenseNumber) = LOWER(?)').get(orgId, licenseNumber);
  if (existing) {
    const err = new ApiError(409, 'License number already exists');
    err.errors = { licenseNumber: 'This license number is already in use.' };
    throw err;
  }

  const result = db
    .prepare(
      `INSERT INTO drivers (orgId, name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`
    )
    .run(orgId, name, licenseNumber, licenseCategory, licenseExpiry, contactNumber || null, safetyScore || 0);

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(result.lastInsertRowid);
  
  res.status(201).json({
    id: String(driver.id),
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiry: driver.licenseExpiry,
    contactNumber: driver.contactNumber || '',
    safetyScore: Number(driver.safetyScore || 0),
    status: driver.status,
    assignedVehicleId: driver.assignedVehicleId ? String(driver.assignedVehicleId) : null,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt
  });
});

// PATCH /api/drivers/:id
const updateDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const existing = db.prepare('SELECT * FROM drivers WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!existing) throw new ApiError(404, 'Driver not found');

  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status, assignedVehicleId } = req.body;

  if (licenseNumber && licenseNumber.toLowerCase() !== existing.licenseNumber.toLowerCase()) {
    const isDuplicate = db.prepare('SELECT id FROM drivers WHERE orgId = ? AND id != ? AND LOWER(licenseNumber) = LOWER(?)').get(orgId, req.params.id, licenseNumber);
    if (isDuplicate) {
      const err = new ApiError(409, 'License number already exists');
      err.errors = { licenseNumber: 'This license number is already in use.' };
      throw err;
    }
  }

  const fields = { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status, assignedVehicleId };
  const updates = {};
  Object.keys(fields).forEach((f) => {
    if (fields[f] !== undefined) updates[f] = fields[f];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE drivers SET ${setClause}, updatedAt = datetime('now') WHERE id = ? AND orgId = ?`)
    .run(...values, req.params.id, orgId);

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);

  res.json({
    id: String(driver.id),
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiry: driver.licenseExpiry,
    contactNumber: driver.contactNumber || '',
    safetyScore: Number(driver.safetyScore || 0),
    status: driver.status,
    assignedVehicleId: driver.assignedVehicleId ? String(driver.assignedVehicleId) : null,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt
  });
});

// DELETE /api/drivers/:id
const deleteDriver = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM drivers WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Driver not found');
  res.status(200).json({ success: true });
});

module.exports = { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver };
