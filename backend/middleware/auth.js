const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token missing. Use: Bearer <token>'));
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, orgId, role, email } (note orgId is camelCase now)
    next();
  } catch (err) {
    next(err);
  }
}

// Restrict route to specific roles, e.g. authorize('admin', 'manager')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    
    // fleet_manager is superuser role from frontend, allow all
    if (req.user.role === 'fleet_manager') {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
