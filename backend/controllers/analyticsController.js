const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/analytics/dashboard -- top-level summary cards for the dashboard screen
const getDashboardSummary = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;

  const vehicleCounts = db
    .prepare(`SELECT status, COUNT(*) AS count FROM vehicles WHERE org_id = ? GROUP BY status`)
    .all(orgId);

  const driverCounts = db
    .prepare(`SELECT status, COUNT(*) AS count FROM drivers WHERE org_id = ? GROUP BY status`)
    .all(orgId);

  const tripCounts = db
    .prepare(`SELECT status, COUNT(*) AS count FROM trips WHERE org_id = ? GROUP BY status`)
    .all(orgId);

  const totalVehicles = db.prepare(`SELECT COUNT(*) AS count FROM vehicles WHERE org_id = ?`).get(orgId).count;
  const totalDrivers = db.prepare(`SELECT COUNT(*) AS count FROM drivers WHERE org_id = ?`).get(orgId).count;

  const activeTripsToday = db
    .prepare(
      `SELECT COUNT(*) AS count FROM trips
       WHERE org_id = ? AND status = 'in_progress'`
    )
    .get(orgId).count;

  const fuelCostThisMonth = db
    .prepare(
      `SELECT COALESCE(SUM(cost), 0) AS total FROM fuel_logs
       WHERE org_id = ? AND strftime('%Y-%m', log_date) = strftime('%Y-%m', 'now')`
    )
    .get(orgId).total;

  const maintenanceCostThisMonth = db
    .prepare(
      `SELECT COALESCE(SUM(cost), 0) AS total FROM maintenance_records
       WHERE org_id = ? AND strftime('%Y-%m', service_date) = strftime('%Y-%m', 'now')`
    )
    .get(orgId).total;

  const upcomingMaintenance = db
    .prepare(
      `SELECT m.*, v.registration_no AS vehicle_registration
       FROM maintenance_records m JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.org_id = ? AND m.next_due_date IS NOT NULL AND m.next_due_date >= date('now')
       ORDER BY m.next_due_date ASC LIMIT 5`
    )
    .all(orgId);

  const toMap = (rows) => rows.reduce((acc, r) => ({ ...acc, [r.status]: r.count }), {});

  res.json({
    success: true,
    data: {
      totals: { vehicles: totalVehicles, drivers: totalDrivers, active_trips: activeTripsToday },
      vehicles_by_status: toMap(vehicleCounts),
      drivers_by_status: toMap(driverCounts),
      trips_by_status: toMap(tripCounts),
      costs_this_month: {
        fuel: fuelCostThisMonth,
        maintenance: maintenanceCostThisMonth,
        total: fuelCostThisMonth + maintenanceCostThisMonth,
      },
      upcoming_maintenance: upcomingMaintenance,
    },
  });
});

// GET /api/analytics/fleet-utilization -- trips & distance per vehicle
const getFleetUtilization = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const rows = db
    .prepare(
      `SELECT v.id AS vehicle_id, v.registration_no, v.type, v.status,
              COUNT(t.id) AS total_trips,
              COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.distance_km ELSE 0 END), 0) AS total_distance_km
       FROM vehicles v
       LEFT JOIN trips t ON t.vehicle_id = v.id
       WHERE v.org_id = ?
       GROUP BY v.id
       ORDER BY total_trips DESC`
    )
    .all(orgId);
  res.json({ success: true, data: rows });
});

// GET /api/analytics/fuel-efficiency -- cost & consumption per vehicle
const getFuelEfficiency = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const rows = db
    .prepare(
      `SELECT v.id AS vehicle_id, v.registration_no,
              COALESCE(SUM(f.liters), 0) AS total_liters,
              COALESCE(SUM(f.cost), 0) AS total_cost,
              COUNT(f.id) AS fill_ups
       FROM vehicles v
       LEFT JOIN fuel_logs f ON f.vehicle_id = v.id
       WHERE v.org_id = ?
       GROUP BY v.id
       ORDER BY total_cost DESC`
    )
    .all(orgId);
  res.json({ success: true, data: rows });
});

// GET /api/analytics/maintenance-costs -- cost breakdown by vehicle and type
const getMaintenanceCosts = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;

  const byVehicle = db
    .prepare(
      `SELECT v.id AS vehicle_id, v.registration_no, COALESCE(SUM(m.cost), 0) AS total_cost, COUNT(m.id) AS record_count
       FROM vehicles v LEFT JOIN maintenance_records m ON m.vehicle_id = v.id
       WHERE v.org_id = ? GROUP BY v.id ORDER BY total_cost DESC`
    )
    .all(orgId);

  const byType = db
    .prepare(
      `SELECT type, COALESCE(SUM(cost), 0) AS total_cost, COUNT(*) AS record_count
       FROM maintenance_records WHERE org_id = ? GROUP BY type`
    )
    .all(orgId);

  res.json({ success: true, data: { by_vehicle: byVehicle, by_type: byType } });
});

// GET /api/analytics/monthly-trend?months=6 -- fuel & maintenance cost trend for charts
const getMonthlyTrend = asyncHandler(async (req, res) => {
  const orgId = req.user.org_id;
  const months = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 24);

  const fuelTrend = db
    .prepare(
      `SELECT strftime('%Y-%m', log_date) AS month, COALESCE(SUM(cost), 0) AS fuel_cost
       FROM fuel_logs WHERE org_id = ? AND log_date >= date('now', '-' || ? || ' months')
       GROUP BY month ORDER BY month ASC`
    )
    .all(orgId, months);

  const maintenanceTrend = db
    .prepare(
      `SELECT strftime('%Y-%m', service_date) AS month, COALESCE(SUM(cost), 0) AS maintenance_cost
       FROM maintenance_records WHERE org_id = ? AND service_date >= date('now', '-' || ? || ' months')
       GROUP BY month ORDER BY month ASC`
    )
    .all(orgId, months);

  const tripTrend = db
    .prepare(
      `SELECT strftime('%Y-%m', scheduled_start) AS month, COUNT(*) AS trip_count
       FROM trips WHERE org_id = ? AND scheduled_start >= date('now', '-' || ? || ' months')
       GROUP BY month ORDER BY month ASC`
    )
    .all(orgId, months);

  res.json({ success: true, data: { fuel_trend: fuelTrend, maintenance_trend: maintenanceTrend, trip_trend: tripTrend } });
});

module.exports = {
  getDashboardSummary,
  getFleetUtilization,
  getFuelEfficiency,
  getMaintenanceCosts,
  getMonthlyTrend,
};
