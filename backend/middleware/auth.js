const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('enrolledCourses.course');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }

    // Verify device fingerprint
    const clientFingerprint = req.headers['x-device-fingerprint'];
    if (clientFingerprint) {
      const deviceExists = user.devices.some(d => d.fingerprint === clientFingerprint);
      if (!deviceExists && !user.canAddDevice()) {
        return res.status(403).json({ 
          message: 'Device limit reached. Contact instructor on Telegram @khaliq29',
          code: 'DEVICE_LIMIT'
        });
      }
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please reactivate.', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user has access to specific course
const courseAccessMiddleware = (courseIdParam = 'courseId') => {
  return async (req, res, next) => {
    try {
      const courseId = req.params[courseIdParam] || req.body.courseId;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID required.' });
      }

      const hasAccess = req.user.enrolledCourses.some(
        enrollment => enrollment.course._id.toString() === courseId
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'You do not have access to this course.',
          code: 'NO_ACCESS'
        });
      }

      req.courseId = courseId;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking course access.' });
    }
  };
};

module.exports = { authMiddleware, courseAccessMiddleware };
