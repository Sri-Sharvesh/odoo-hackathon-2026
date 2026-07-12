const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/maintenance
const getRecords = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, status } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE orgId = ?';
  const params = [orgId];

  if (vehicleId) {
    where += ' AND vehicleId = ?';
    params.push(vehicleId);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM maintenance_records ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM maintenance_records ${where} ORDER BY scheduledDate DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    vehicleId: String(r.vehicleId),
    description: r.description,
    cost: Number(r.cost || 0),
    scheduledDate: r.scheduledDate,
    status: r.status,
    notes: r.notes || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/maintenance/:id
const getRecordById = asyncHandler(async (req, res) => {
  const record = db.prepare(`SELECT * FROM maintenance_records WHERE id = ? AND orgId = ?`).get(req.params.id, req.user.orgId);
  if (!record) throw new ApiError(404, 'Maintenance record not found');

  res.json({
    id: String(record.id),
    vehicleId: String(record.vehicleId),
    description: record.description,
    cost: Number(record.cost || 0),
    scheduledDate: record.scheduledDate,
    status: record.status,
    notes: record.notes || '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  });
});

// POST /api/maintenance
const createRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, description, cost, scheduledDate, notes } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?').get(vehicleId, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  if (vehicle.status !== 'available') {
    const err = new ApiError(409, 'Vehicle is not available for maintenance');
    err.errors = { vehicleId: 'This vehicle is not available for maintenance.' };
    throw err;
  }

  const result = db.transaction(() => {
    const insertResult = db
      .prepare(
        `INSERT INTO maintenance_records (orgId, vehicleId, description, cost, scheduledDate, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'open')`
      )
      .run(orgId, vehicleId, description, cost || 0, scheduledDate, notes || null);

    db.prepare("UPDATE vehicles SET status = 'in_shop', updatedAt = datetime('now') WHERE id = ?").run(vehicleId);
    return insertResult.lastInsertRowid;
  })();

  const record = db.prepare(`SELECT * FROM maintenance_records WHERE id = ?`).get(result);

  res.status(201).json({
    id: String(record.id),
    vehicleId: String(record.vehicleId),
    description: record.description,
    cost: Number(record.cost || 0),
    scheduledDate: record.scheduledDate,
    status: record.status,
    notes: record.notes || '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  });
});

// POST /api/maintenance/:id/close
const closeRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const record = db.prepare('SELECT * FROM maintenance_records WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!record) throw new ApiError(404, 'Maintenance record not found');

  if (record.status !== 'open') {
    throw new ApiError(409, 'Only open records can be closed');
  }

  db.transaction(() => {
    db.prepare("UPDATE maintenance_records SET status = 'closed', updatedAt = datetime('now') WHERE id = ?").run(record.id);
    db.prepare("UPDATE vehicles SET status = 'available', updatedAt = datetime('now') WHERE id = ?").run(record.vehicleId);
  })();

  const updated = db.prepare('SELECT * FROM maintenance_records WHERE id = ?').get(record.id);

  res.json({
    id: String(updated.id),
    vehicleId: String(updated.vehicleId),
    description: updated.description,
    cost: Number(updated.cost || 0),
    scheduledDate: updated.scheduledDate,
    status: updated.status,
    notes: updated.notes || '',
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// DELETE /api/maintenance/:id
const deleteRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM maintenance_records WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Maintenance record not found');
  res.status(200).json({ success: true });
});

module.exports = { getRecords, getRecordById, createRecord, closeRecord, deleteRecord };
