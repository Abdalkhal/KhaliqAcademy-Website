const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. Admin login required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid admin token.' });
  }
};

module.exports = { adminAuthMiddleware };
