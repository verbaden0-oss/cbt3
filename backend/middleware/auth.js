const jwt = require('jsonwebtoken');
// JWT_SECRET is required in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
// Fallback only for development
const JWT_SECRET_FINAL = JWT_SECRET || 'dev_secret_only_for_local_development';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET_FINAL);
    req.userId = payload.userId;
    console.log(`[Auth] User verified: ${req.userId}`);
    next();
  } catch (err) {
    console.error(`[Auth] Token verification failed: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = { authMiddleware };
