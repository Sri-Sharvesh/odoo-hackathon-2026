const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register-organization
const registerOrganization = asyncHandler(async (req, res) => {
  const { organization_name, name, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const insertOrg = db.prepare('INSERT INTO organizations (name) VALUES (?)');
  const orgResult = insertOrg.run(organization_name);
  const orgId = orgResult.lastInsertRowid;

  const passwordHash = await bcrypt.hash(password, 10);
  const insertUser = db.prepare(
    'INSERT INTO users (orgId, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)'
  );
  const userResult = insertUser.run(orgId, name, email, passwordHash, 'fleet_manager');

  const token = jwt.sign(
    { id: userResult.lastInsertRowid, orgId, role: 'fleet_manager', email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return AuthSession payload directly
  res.status(201).json({
    token,
    user: {
      id: String(userResult.lastInsertRowid),
      name,
      email,
      role: 'fleet_manager',
      orgId: String(orgId)
    }
  });
});

// POST /api/auth/register-user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const orgId = req.user.orgId;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const insertUser = db.prepare(
    'INSERT INTO users (orgId, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)'
  );
  const result = insertUser.run(orgId, name, email, passwordHash, role || 'dispatcher');

  // Return User object directly
  res.status(201).json({
    id: String(result.lastInsertRowid),
    name,
    email,
    role: role || 'dispatcher',
    orgId: String(orgId)
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = jwt.sign(
    { id: user.id, orgId: user.orgId, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Return AuthSession payload directly
  res.json({
    token,
    user: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: String(user.orgId)
    }
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = db.prepare('SELECT id, orgId, name, email, role, createdAt FROM users WHERE id = ?').get(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  
  // Return User object directly
  res.json({
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: String(user.orgId),
    createdAt: user.createdAt
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true });
});

module.exports = { registerOrganization, registerUser, login, me, logout };
