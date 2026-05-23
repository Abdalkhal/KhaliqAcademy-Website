const jwt = require('jsonwebtoken');

const generateUserToken = (userId, deviceFingerprint) => {
  return jwt.sign(
    { userId, deviceFingerprint, type: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, role: 'admin', type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateUserToken,
  generateAdminToken,
  verifyToken
};
