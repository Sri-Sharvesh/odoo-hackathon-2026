const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('admin','manager','dispatcher')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  registration_no TEXT NOT NULL,
  type TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity INTEGER,
  odometer REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','maintenance','inactive')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(org_id, registration_no)
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','on_trip','off_duty')),
  assigned_vehicle_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  UNIQUE(org_id, license_number)
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT,
  actual_start TEXT,
  actual_end TEXT,
  distance_km REAL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','in_progress','completed','cancelled')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('service','repair','inspection')),
  description TEXT,
  cost REAL DEFAULT 0,
  service_date TEXT NOT NULL,
  next_due_date TEXT,
  odometer_reading REAL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('scheduled','in_progress','completed')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  driver_id INTEGER,
  log_date TEXT NOT NULL,
  liters REAL NOT NULL,
  cost REAL NOT NULL,
  odometer_reading REAL,
  fuel_station TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(org_id);
CREATE INDEX IF NOT EXISTS idx_drivers_org ON drivers(org_id);
CREATE INDEX IF NOT EXISTS idx_trips_org ON trips(org_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_org ON maintenance_records(org_id);
CREATE INDEX IF NOT EXISTS idx_fuel_org ON fuel_logs(org_id);
`);

module.exports = db;
