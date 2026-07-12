const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const router = express.Router();

router.use(authenticate);

router.get('/', getExpenses);

router.get('/:id', [param('id').isInt()], validate, getExpenseById);

router.post(
  '/',
  authorize('admin', 'manager', 'dispatcher'),
  [
    body('vehicleId').isInt().withMessage('vehicleId must be an integer'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
    body('description').optional().trim(),
  ],
  validate,
  createExpense
);

router.patch(
  '/:id',
  authorize('admin', 'manager', 'dispatcher'),
  [
    param('id').isInt(),
    body('vehicleId').optional().isInt(),
    body('category').optional().trim().notEmpty(),
    body('amount').optional().isFloat({ min: 0 }),
    body('date').optional().isISO8601(),
    body('description').optional().trim(),
  ],
  validate,
  updateExpense
);

router.delete('/:id', authorize('admin', 'manager'), [param('id').isInt()], validate, deleteExpense);

module.exports = router;
