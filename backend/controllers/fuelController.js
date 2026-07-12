const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const LOG_SELECT = `
  SELECT f.*, v.registration_no AS vehicle_registration, dr.name AS driver_name
  FROM fuel_logs f
  JOIN vehicles v ON v.id = f.vehicle_id
  LEFT JOIN drivers dr ON dr.id = f.driver_id
`;

const getLogs = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id, driver_id, from, to } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE f.org_id = ?';
  const params = [orgId];
  if (vehicle_id) { where += ' AND f.vehicle_id = ?'; params.push(vehicle_id); }
  if (driver_id) { where += ' AND f.driver_id = ?'; params.push(driver_id); }
  if (from) { where += ' AND f.log_date >= ?'; params.push(from); }
  if (to) { where += ' AND f.log_date <= ?'; params.push(to); }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM fuel_logs f ${where}`).get(...params).count;
  const rows = db
    .prepare(`${LOG_SELECT} ${where} ORDER BY f.log_date DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  res.json({ success: true, data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const getLogById = asyncHandler(async (req, res) => {
  const log = db.prepare(`${LOG_SELECT} WHERE f.id = ? AND f.org_id = ?`).get(req.params.id, req.user.org_id);
  if (!log) throw new ApiError(404, 'Fuel log not found');
  res.json({ success: true, data: log });
});

const createLog = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const { vehicle_id, driver_id, log_date, liters, cost, odometer_reading, fuel_station } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND org_id = ?').get(vehicle_id, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  if (driver_id) {
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ? AND org_id = ?').get(driver_id, orgId);
    if (!driver) throw new ApiError(404, 'Driver not found');
  }

  const create = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO fuel_logs (org_id, vehicle_id, driver_id, log_date, liters, cost, odometer_reading, fuel_station)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(orgId, vehicle_id, driver_id || null, log_date, liters, cost, odometer_reading || null, fuel_station || null);

    if (odometer_reading) {
      db.prepare(`UPDATE vehicles SET odometer = MAX(odometer, ?), updated_at = datetime('now') WHERE id = ?`).run(odometer_reading, vehicle_id);
    }
    return result.lastInsertRowid;
  });

  const id = create();
  const log = db.prepare(`${LOG_SELECT} WHERE f.id = ?`).get(id);
  res.status(201).json({ success: true, data: log });
});

const updateLog = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const log = db.prepare('SELECT * FROM fuel_logs WHERE id = ? AND org_id = ?').get(req.params.id, orgId);
  if (!log) throw new ApiError(404, 'Fuel log not found');

  const fields = ['log_date', 'liters', 'cost', 'odometer_reading', 'fuel_station'];
  const updates = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  db.prepare(`UPDATE fuel_logs SET ${setClause} WHERE id = ?`).run(...Object.values(updates), log.id);

  const updated = db.prepare(`${LOG_SELECT} WHERE f.id = ?`).get(log.id);
  res.json({ success: true, data: updated });
});

const deleteLog = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const result = db.prepare('DELETE FROM fuel_logs WHERE id = ? AND org_id = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Fuel log not found');
  res.json({ success: true, message: 'Fuel log deleted successfully' });
});

module.exports = { getLogs, getLogById, createLog, updateLog, deleteLog };
