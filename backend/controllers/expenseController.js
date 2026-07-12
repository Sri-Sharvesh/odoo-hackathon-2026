const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/expenses
const getExpenses = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, category, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.pageSize) || 20, 1), 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE orgId = ?';
  const params = [orgId];

  if (vehicleId) {
    where += ' AND vehicleId = ?';
    params.push(vehicleId);
  }
  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    where += ' AND (category LIKE ? OR description LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM expenses ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM expenses ${where} ORDER BY date DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  const mappedRows = rows.map((r) => ({
    id: String(r.id),
    vehicleId: String(r.vehicleId),
    category: r.category,
    amount: Number(r.amount),
    date: r.date,
    description: r.description || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  res.json({
    data: mappedRows,
    meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/expenses/:id
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND orgId = ?').get(req.params.id, req.user.orgId);
  if (!expense) throw new ApiError(404, 'Expense not found');

  res.json({
    id: String(expense.id),
    vehicleId: String(expense.vehicleId),
    category: expense.category,
    amount: Number(expense.amount),
    date: expense.date,
    description: expense.description || '',
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  });
});

// POST /api/expenses
const createExpense = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const { vehicleId, category, amount, date, description } = req.body;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND orgId = ?').get(vehicleId, orgId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const result = db
    .prepare(
      `INSERT INTO expenses (orgId, vehicleId, category, amount, date, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(orgId, vehicleId, category, amount, date, description || null);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    id: String(expense.id),
    vehicleId: String(expense.vehicleId),
    category: expense.category,
    amount: Number(expense.amount),
    date: expense.date,
    description: expense.description || '',
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  });
});

// PATCH /api/expenses/:id
const updateExpense = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND orgId = ?').get(req.params.id, orgId);
  if (!expense) throw new ApiError(404, 'Expense not found');

  const { vehicleId, category, amount, date, description } = req.body;
  const fields = { vehicleId, category, amount, date, description };
  const updates = {};
  Object.keys(fields).forEach((f) => {
    if (fields[f] !== undefined) updates[f] = fields[f];
  });

  if (Object.keys(updates).length === 0) throw new ApiError(400, 'No valid fields provided to update');

  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE expenses SET ${setClause}, updatedAt = datetime('now') WHERE id = ? AND orgId = ?`)
    .run(...values, req.params.id, orgId);

  const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);

  res.json({
    id: String(updated.id),
    vehicleId: String(updated.vehicleId),
    category: updated.category,
    amount: Number(updated.amount),
    date: updated.date,
    description: updated.description || '',
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  });
});

// DELETE /api/expenses/:id
const deleteExpense = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;
  const result = db.prepare('DELETE FROM expenses WHERE id = ? AND orgId = ?').run(req.params.id, orgId);
  if (result.changes === 0) throw new ApiError(404, 'Expense not found');
  res.status(200).json({ success: true });
});

module.exports = { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
