const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register-organization
// Creates a brand new organization plus its first admin user
const registerOrganization = asyncHandler(async (req, res) => {
  const { organization_name, name, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const insertOrg = db.prepare('INSERT INTO organizations (name) VALUES (?)');
  const orgResult = insertOrg.run(organization_name);
  const orgId = orgResult.lastInsertRowid;

  const password_hash = await bcrypt.hash(password, 10);
  const insertUser = db.prepare(
    'INSERT INTO users (org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  );
  const userResult = insertUser.run(orgId, name, email, password_hash, 'admin');

  const token = jwt.sign(
    { id: userResult.lastInsertRowid, org_id: orgId, role: 'admin', email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: userResult.lastInsertRowid, name, email, role: 'admin', org_id: orgId },
      organization: { id: orgId, name: organization_name },
    },
  });
});

// POST /api/auth/register-user
// Adds a new user (staff) to the caller's existing organization. Requires admin auth.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const org_id = req.user.org_id;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const insertUser = db.prepare(
    'INSERT INTO users (org_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
  );
  const result = insertUser.run(org_id, name, email, password_hash, role || 'dispatcher');

  res.status(201).json({
    success: true,
    data: { id: result.lastInsertRowid, name, email, role: role || 'dispatcher', org_id },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = jwt.sign(
    { id: user.id, org_id: user.org_id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, org_id: user.org_id },
    },
  });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = db.prepare('SELECT id, org_id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

module.exports = { registerOrganization, registerUser, login, me };

