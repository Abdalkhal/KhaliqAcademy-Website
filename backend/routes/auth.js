const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const { body, validationResult } = require('express-validator');
const { User, ActivationCode, Course, EnrollmentLog } = require('../models');
const { generateDeviceFingerprint, generateVideoToken } = require('../utils/codeGenerator');
const { generateUserToken } = require('../utils/jwt');
const { activationLimiter } = require('../middleware/rateLimit');

// @route   POST /api/auth/activate
// @desc    Activate course access with code
// @access  Public
router.post('/activate', 
  activationLimiter,
  [
    body('code').trim().matches(/^KH-[A-Z0-9]{4}-[A-Z0-9]{4}$/).withMessage('Invalid code format'),
    body('courseId').isMongoId().withMessage('Invalid course ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { code, courseId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const fingerprint = generateDeviceFingerprint(req);
      const parsedUA = new UAParser(userAgent).getResult();

      // Find activation code
      const activationCode = await ActivationCode.findOne({ codePlain: code });

      if (!activationCode) {
        return res.status(400).json({ 
          message: 'Invalid activation code.',
          code: 'INVALID_CODE'
        });
      }

      // Verify code matches course
      if (activationCode.course.toString() !== courseId) {
        return res.status(400).json({
          message: 'This code is not valid for the selected course.',
          code: 'WRONG_COURSE'
        });
      }

      // Check if user already exists with this code
      let user = await User.findOne({ activationCodeId: activationCode._id });

      if (user) {
        // Existing user login flow - verify device limits
        try {
          await user.updateDevice(fingerprint, ipAddress, userAgent, parsedUA);
        } catch (err) {
          if (err.message === 'DEVICE_LIMIT_REACHED') {
            return res.status(403).json({
              message: 'Maximum device limit reached (1 device). Contact @khaliq29 on Telegram.',
              code: 'DEVICE_LIMIT'
            });
          }
          throw err;
        }
      } else {
        // New user activation flow
        
        // Check if code is valid for new activation
        if (!activationCode.isValid()) {
          if (activationCode.expiryDate && new Date() > activationCode.expiryDate) {
            return res.status(400).json({
              message: 'This activation code has expired. Contact @khaliq29 on Telegram.',
              code: 'CODE_EXPIRED'
            });
          }
          return res.status(400).json({
            message: 'This activation code has already been used.',
            code: 'CODE_USED'
          });
        }

        // Create new user
        user = new User({
          activationCodeId: activationCode._id,
          enrolledCourses: [{
            course: courseId,
            enrolledAt: new Date()
          }],
          devices: [{
            fingerprint,
            ipAddress,
            userAgent,
            browser: parsedUA.browser?.name,
            os: parsedUA.os?.name,
            device: parsedUA.device?.type || 'desktop'
          }]
        });
        await user.save();

        // Update course enrolled count
        await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

        // Mark code as used
        activationCode.isUsed = true;
        activationCode.usedAt = new Date();
        activationCode.usedBy = user._id;
        activationCode.usageCount += 1;
        await activationCode.save();

        // Create enrollment log
        await EnrollmentLog.create({
          user: user._id,
          course: courseId,
          activationCode: activationCode._id,
          deviceFingerprint: fingerprint,
          ipAddress,
          userAgent,
          browser: parsedUA.browser?.name,
          os: parsedUA.os?.name,
          device: parsedUA.device?.type || 'desktop'
        });
      }

      // Generate JWT
      const token = generateUserToken(user._id, fingerprint);

      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Course access activated successfully!',
        token,
        user: {
          id: user._id,
          enrolledCourses: user.enrolledCourses.map(e => ({
            courseId: e.course._id || e.course,
            progress: e.progress,
            enrolledAt: e.enrolledAt
          }))
        }
      });

    } catch (error) {
      console.error('Activation error:', error);
      res.status(500).json({ message: 'Server error during activation.' });
    }
  }
);

// @route   POST /api/auth/verify
// @desc    Verify token and get user info
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .populate('enrolledCourses.course', 'title thumbnail price');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        enrolledCourses: user.enrolledCourses.map(e => ({
          courseId: e.course._id,
          title: e.course.title,
          thumbnail: e.course.thumbnail,
          progress: e.progress,
          enrolledAt: e.enrolledAt
        })),
        devices: user.devices.map(d => ({
          browser: d.browser,
          os: d.os,
          device: d.device,
          lastActive: d.lastActive
        }))
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
