const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const REC_SELECT = `
  SELECT m.*, v.registration_no AS vehicle_registration
  FROM maintenance_records m
  JOIN vehicles v ON v.id = m.vehicle_id
`;

const getRecords = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id, status, type } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE m.org_id = ?';
  const params = [orgId];
  if (vehicle_id) { where += ' AND m.vehicle_id = ?'; params.push(vehicle_id); }
  if (status) { where += ' AND m.status = ?'; params.push(status); }
  if (type) { where += ' AND m.type = ?'; params.push(type); }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM maintenance_records m ${where}`).get(...params).count;
  const rows = db
    .prepare(`${REC_SELECT} ${where} ORDER BY m.service_date DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = db.prepare(`${REC_SELECT} WHERE m.id = ? AND m.org_id = ?`).get(req.params.id, req.user.org_id);
  if (!record) throw new ApiError(404, 'Maintenance record not found');
  res.json({ success: true, data: record });
});

// POST /api/maintenance -- also flips vehicle to 'maintenance' status when work begins
const createRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id, type, description, cost, service_date, next_due_date, odometer_reading, status } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?').get(vehicle_id, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const recordStatus = status || 'completed';

  const create = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO maintenance_records (org_id, vehicle_id, type, description, cost, service_date, next_due_date, odometer_reading, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(orgId, vehicle_id, type, description || null, cost || 0, service_date, next_due_date || null, odometer_reading || null, recordStatus);

    if (recordStatus === 'in_progress' || recordStatus === 'scheduled') {
      db.prepare(`UPDATE vehicles SET status = 'maintenance', updated_at = datetime('now') WHERE id = ?`).run(vehicle_id);
    }
    if (odometer_reading) {
      db.prepare(`UPDATE vehicles SET odometer = MAX(odometer, ?), updated_at = datetime('now') WHERE id = ?`).run(odometer_reading, vehicle_id);
    }
    return result.lastInsertRowid;
  });

  const id = create();
  const record = db.prepare(`${REC_SELECT} WHERE m.id = ?`).get(id);
  res.status(201).json({ success: true, data: record });
});

// PATCH /api/maintenance/:id/status -- e.g. mark completed, which returns vehicle to active
const updateRecordStatus = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { status } = req.body;
  const record = db.prepare('SELECT * FROM maintenance_records WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!record) throw new ApiError(404, 'Maintenance record not found');

  const apply = db.transaction(() => {
    db.prepare('UPDATE maintenance_records SET status = ? WHERE id = ?').run(status, record.id);
    if (status === 'completed') {
      db.prepare(`UPDATE vehicles SET status = 'active', updated_at = datetime('now') WHERE id = ?`).run(record.vehicle_id);
    } else if (status === 'in_progress' || status === 'scheduled') {
      db.prepare(`UPDATE vehicles SET status = 'maintenance', updated_at = datetime('now') WHERE id = ?`).run(record.vehicle_id);
    }
  });
  apply();

  const updated = db.prepare(`${REC_SELECT} WHERE m.id = ?`).get(record.id);
  res.json({ success: true, data: updated });
});

const updateRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const record = db.prepare('SELECT * FROM maintenance_records WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!record) throw new ApiError(404, 'Maintenance record not found');

  const fields = ['type', 'description', 'cost', 'service_date', 'next_due_date', 'odometer_reading'];
  const updates = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE maintenance_records SET ${setClause} WHERE id = ?`).run(...Object.values(updates), record.id);

  const updated = db.prepare(`${REC_SELECT} WHERE m.id = ?`).get(record.id);
  res.json({ success: true, data: updated });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const result = db.prepare('DELETE FROM maintenance_records WHERE id = ? AND org_id = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Maintenance record not found');
  res.json({ success: true, message: 'Maintenance record deleted successfully' });
});

module.exports = { getRecords, getRecordById, createRecord, updateRecordStatus, updateRecord, deleteRecord };
