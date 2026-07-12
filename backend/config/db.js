const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, 'transitops.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'dispatcher',
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  registrationNumber TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL,
  maxLoadCapacityKg INTEGER NOT NULL,
  odometerKm REAL DEFAULT 0,
  acquisitionCost REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(orgId, registrationNumber)
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  name TEXT NOT NULL,
  licenseNumber TEXT NOT NULL,
  licenseCategory TEXT NOT NULL,
  licenseExpiry TEXT NOT NULL,
  contactNumber TEXT,
  safetyScore REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  assignedVehicleId INTEGER,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedVehicleId) REFERENCES vehicles(id) ON DELETE SET NULL,
  UNIQUE(orgId, licenseNumber)
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  driverId INTEGER NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargoWeightKg REAL DEFAULT 0,
  plannedDistanceKm REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  finalOdometerKm REAL,
  fuelConsumedLiters REAL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (driverId) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  description TEXT NOT NULL,
  cost REAL DEFAULT 0,
  scheduledDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  liters REAL NOT NULL,
  cost REAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orgId INTEGER NOT NULL,
  vehicleId INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (orgId) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(orgId);
CREATE INDEX IF NOT EXISTS idx_drivers_org ON drivers(orgId);
CREATE INDEX IF NOT EXISTS idx_trips_org ON trips(orgId);
CREATE INDEX IF NOT EXISTS idx_maintenance_org ON maintenance_records(orgId);
CREATE INDEX IF NOT EXISTS idx_fuel_org ON fuel_logs(orgId);
CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(orgId);
`);

// ---------- Seed Default Data ----------
const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (userCount === 0) {
  db.transaction(() => {
    const orgResult = db.prepare("INSERT INTO organizations (name) VALUES ('TransitOps Org')").run();
    const orgId = orgResult.lastInsertRowid;
    
    const passwordHash = bcrypt.hashSync('password', 10);
    db.prepare(`
      INSERT INTO users (orgId, name, email, passwordHash, role)
      VALUES (?, 'Alex Morgan', 'manager@transitops.dev', ?, 'fleet_manager')
    `).run(orgId, passwordHash);

    console.log('Database seeded with default organization and user: manager@transitops.dev / password');
  })();
}

module.exports = db;
