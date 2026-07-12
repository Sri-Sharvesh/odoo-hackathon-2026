const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/summary
const getDashboardSummary = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { type, status } = req.query;

  let vehicleWhere = 'WHERE orgId = ?';
  const vehicleParams = [orgId];
  if (type) {
    vehicleWhere += ' AND type = ?';
    vehicleParams.push(type);
  }
  if (status) {
    vehicleWhere += ' AND status = ?';
    vehicleParams.push(status);
  }

  const vehicles = db.prepare(`SELECT status FROM vehicles ${vehicleWhere}`).all(...vehicleParams);

  const activeVehicles = vehicles.filter((v) => v.status !== 'retired').length;
  const onTripVehicles = vehicles.filter((v) => v.status === 'on_trip').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === 'in_shop').length;

  const trips = db.prepare(`SELECT status FROM trips WHERE orgId = ?`).all(orgId);
  const activeTrips = trips.filter((t) => t.status === 'dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'draft').length;

  const drivers = db.prepare(`SELECT status FROM drivers WHERE orgId = ?`).all(orgId);
  const driversOnDuty = drivers.filter((d) => d.status === 'available' || d.status === 'on_trip').length;

  const fleetUtilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

  res.json({
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization
  });
});

// GET /api/reports/vehicles
const getVehicleReports = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  const vehicles = db.prepare('SELECT id, registrationNumber, model FROM vehicles WHERE orgId = ?').all(orgId);
  const fuelLogs = db.prepare('SELECT vehicleId, liters, cost FROM fuel_logs WHERE orgId = ?').all(orgId);
  const maintenanceRecords = db.prepare('SELECT vehicleId, cost FROM maintenance_records WHERE orgId = ?').all(orgId);
  const trips = db.prepare("SELECT vehicleId, plannedDistanceKm FROM trips WHERE orgId = ? AND status = 'completed'").all(orgId);

  const reports = vehicles.map((vehicle) => {
    const vId = vehicle.id;
    const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === vId);
    const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.liters), 0);
    const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);

    const totalMaintenanceCost = maintenanceRecords
      .filter((m) => m.vehicleId === vId)
      .reduce((sum, m) => sum + Number(m.cost), 0);

    const totalDistanceKm = trips
      .filter((t) => t.vehicleId === vId)
      .reduce((sum, t) => sum + Number(t.plannedDistanceKm), 0);

    return {
      vehicleId: String(vId),
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      totalDistanceKm,
      totalFuelLiters,
      fuelEfficiencyKmPerLiter: totalFuelLiters > 0 ? totalDistanceKm / totalFuelLiters : null,
      operationalCost: totalFuelCost + totalMaintenanceCost,
      roi: null
    };
  });

  res.json(reports);
});

const getFleetUtilization = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

const getFuelEfficiency = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

const getMaintenanceCosts = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = {
  getDashboardSummary,
  getVehicleReports,
  getFleetUtilization,
  getFuelEfficiency,
  getMaintenanceCosts,
  getMonthlyTrend,
};
