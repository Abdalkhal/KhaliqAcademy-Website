const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { 
  Course, 
  Lecture, 
  ActivationCode, 
  User, 
  EnrollmentLog, 
  Admin 
} = require('../models');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const { adminLoginLimiter } = require('../middleware/rateLimit');
const { generateActivationCode } = require('../utils/codeGenerator');
const { generateAdminToken } = require('../utils/jwt');
const upload = require('../middleware/upload');

// ============ AUTH ============

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.isLocked()) {
      return res.status(423).json({ 
        message: 'Account locked. Try again later.',
        lockUntil: admin.lockUntil
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await admin.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset attempts
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ DASHBOARD STATS ============

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Admin
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalLectures = await Lecture.countDocuments();
    const totalStudents = await User.countDocuments();
    const totalCodes = await ActivationCode.countDocuments();
    const usedCodes = await ActivationCode.countDocuments({ isUsed: true });
    const unusedCodes = totalCodes - usedCodes;

    // Recent enrollments (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEnrollments = await EnrollmentLog.countDocuments({
      enrolledAt: { $gte: last7Days }
    });

    // Course enrollment stats
    const courses = await Course.find().select('title enrolledCount');

    res.json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        totalLectures,
        totalStudents,
        totalCodes,
        usedCodes,
        unusedCodes,
        recentEnrollments,
        courses: courses.map(c => ({
          id: c._id,
          title: c.title,
          enrolledCount: c.enrolledCount
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// ============ COURSE MANAGEMENT ============

// @route   GET /api/admin/courses
// @desc    Get all courses (admin view)
// @access  Admin
router.get('/courses', adminAuthMiddleware, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('lectures', 'title order')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description,
        shortDescription: c.shortDescription,
        price: c.price,
        currency: c.currency,
        thumbnail: c.thumbnail,
        category: c.category,
        level: c.level,
        lectureCount: c.lectures.length,
        totalDuration: c.totalDuration,
        enrolledCount: c.enrolledCount,
        isPublished: c.isPublished,
        featured: c.featured,
        order: c.order,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// @route   POST /api/admin/courses
// @desc    Create new course
// @access  Admin
router.post('/courses', 
  adminAuthMiddleware, 
  upload.single('thumbnail'),
  async (req, res) => {
    try {
      const { title, description, shortDescription, price, currency, category, level, order } = req.body;

      const course = new Course({
        title,
        description,
        shortDescription,
        price: Number(price) || 0,
        currency: currency || 'USD',
        thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : null,
        category,
        level: level || 'beginner',
        order: Number(order) || 0,
        isPublished: false
      });

      await course.save();

      res.status(201).json({
        success: true,
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating course' });
    }
  }
);

// @route   PUT /api/admin/courses/:id
// @desc    Update course
// @access  Admin
router.put('/courses/:id', adminAuthMiddleware, upload.single('thumbnail'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    if (req.file) {
      updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course
// @access  Admin
router.delete('/courses/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete associated lectures
    await Lecture.deleteMany({ course: req.params.id });

    // Delete associated activation codes
    await ActivationCode.deleteMany({ course: req.params.id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
});

// ============ LECTURE MANAGEMENT ============

// @route   GET /api/admin/courses/:courseId/lectures
// @desc    Get lectures for a course
// @access  Admin
router.get('/courses/:courseId/lectures', adminAuthMiddleware, async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.courseId })
      .sort({ order: 1 });

    res.json({
      success: true,
      lectures: lectures.map(l => ({
        id: l._id,
        title: l.title,
        description: l.description,
        order: l.order,
        isPreview: l.isPreview,
        videoDuration: l.videoDuration,
        hasVideo: !!l.videoUrl,
        quizCount: l.quiz ? l.quiz.length : 0,
        resourcesCount: l.resources ? l.resources.length : 0,
        createdAt: l.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lectures' });
  }
});

// @route   POST /api/admin/lectures
// @desc    Create lecture with video upload
// @access  Admin
router.post('/lectures', 
  adminAuthMiddleware, 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { courseId, title, description, order, isPreview, videoDuration } = req.body;

      const lecture = new Lecture({
        course: courseId,
        title,
        description,
        videoUrl: req.files?.video ? `uploads/videos/${req.files.video[0].filename}` : null,
        videoDuration: Number(videoDuration) || 0,
        order: Number(order) || 0,
        isPreview: isPreview === 'true'
      });

      await lecture.save();

      // Add lecture to course
      await Course.findByIdAndUpdate(courseId, {
        $push: { lectures: lecture._id }
      });

      res.status(201).json({
        success: true,
        lecture: {
          id: lecture._id,
          title: lecture.title,
          videoUrl: lecture.videoUrl
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating lecture' });
    }
  }
);

// @route   PUT /api/admin/lectures/:id
// @desc    Update lecture
// @access  Admin
router.put('/lectures/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lecture' });
  }
});

// @route   DELETE /api/admin/lectures/:id
// @desc    Delete lecture
// @access  Admin
router.delete('/lectures/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Remove from course
    await Course.findByIdAndUpdate(lecture.course, {
      $pull: { lectures: lecture._id }
    });

    await Lecture.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Lecture deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lecture' });
  }
});

// ============ QUIZ MANAGEMENT ============

// @route   POST /api/admin/lectures/:lectureId/quiz
// @desc    Add quiz questions to lecture
// @access  Admin
router.post('/lectures/:lectureId/quiz', adminAuthMiddleware, async (req, res) => {
  try {
    const { questions } = req.body; // Array of { question, options, correctAnswer, explanation }

    const lecture = await Lecture.findById(req.params.lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    lecture.quiz = questions;
    await lecture.save();

    res.json({
      success: true,
      message: `${questions.length} questions added`,
      quiz: lecture.quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding quiz' });
  }
});

// ============ ACTIVATION CODE MANAGEMENT ============

// @route   POST /api/admin/courses/:courseId/generate-code
// @desc    Generate activation code for a course
// @access  Admin
router.post('/courses/:courseId/generate-code', adminAuthMiddleware, async (req, res) => {
  try {
    const { expiryDays } = req.body;
    const courseId = req.params.courseId;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateActivationCode();
      const existing = await ActivationCode.findOne({ codePlain: code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Could not generate unique code. Try again.' });
    }

    const activationCode = new ActivationCode({
      code, // Will be hashed by pre-save hook
      codePlain: code, // For admin display
      course: courseId,
      expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
      usageLimit: 1,
      usageCount: 0,
      isUsed: false,
      createdBy: req.admin.username
    });

    await activationCode.save();

    res.status(201).json({
      success: true,
      code: code, // Return plain code for copying
      codeId: activationCode._id,
      course: {
        id: course._id,
        title: course.title
      },
      expiryDate: activationCode.expiryDate,
      message: 'Code generated successfully! Share this code with your student.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating code' });
  }
});

// @route   POST /api/admin/generate-bulk-codes
// @desc    Generate multiple codes for a course
// @access  Admin
router.post('/generate-bulk-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const { courseId, count, expiryDays } = req.body;
    const codes = [];

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    for (let i = 0; i < count; i++) {
      let code;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        code = generateActivationCode();
        const existing = await ActivationCode.findOne({ codePlain: code });
        if (!existing) isUnique = true;
        attempts++;
      }

      if (isUnique) {
        const activationCode = new ActivationCode({
          code,
          codePlain: code,
          course: courseId,
          expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
          usageLimit: 1,
          createdBy: req.admin.username
        });
        await activationCode.save();
        codes.push({
          code,
          codeId: activationCode._id,
          expiryDate: activationCode.expiryDate
        });
      }
    }

    res.json({
      success: true,
      generated: codes.length,
      codes,
      course: { id: course._id, title: course.title }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating codes' });
  }
});

// @route   GET /api/admin/codes
// @desc    Get all activation codes
// @access  Admin
router.get('/codes', adminAuthMiddleware, async (req, res) => {
  try {
    const { courseId, status } = req.query;
    let query = {};

    if (courseId) query.course = courseId;
    if (status === 'used') query.isUsed = true;
    if (status === 'unused') query.isUsed = false;

    const codes = await ActivationCode.find(query)
      .populate('course', 'title')
      .populate('usedBy', 'createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      codes: codes.map(c => ({
        id: c._id,
        code: c.codePlain,
        course: c.course ? { id: c.course._id, title: c.course.title } : null,
        isUsed: c.isUsed,
        usedAt: c.usedAt,
        usageCount: c.usageCount,
        expiryDate: c.expiryDate,
        createdAt: c.createdAt,
        createdBy: c.createdBy
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching codes' });
  }
});

// @route   PUT /api/admin/codes/:id
// @desc    Update activation code expiry
// @access  Admin
router.put('/codes/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { expiryDays, removeExpiry } = req.body;
    const code = await ActivationCode.findById(req.params.id);
    
    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    if (removeExpiry) {
      code.expiryDate = null;
    } else if (expiryDays) {
      code.expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    } else if (req.body.expiryDate) {
      code.expiryDate = new Date(req.body.expiryDate);
    }

    await code.save();
    res.json({ success: true, code });
  } catch (error) {
    res.status(500).json({ message: 'Error updating code' });
  }
});

// @route   DELETE /api/admin/codes/:id
// @desc    Delete activation code and associated user
// @access  Admin
router.delete('/codes/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const code = await ActivationCode.findById(req.params.id);
    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    if (code.isUsed) {
      // If code is used, delete the user associated with it to revoke access immediately
      await User.deleteMany({ activationCodeId: code._id });
      await EnrollmentLog.deleteMany({ activationCode: code._id });
    }

    await ActivationCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Code and associated user deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting code' });
  }
});

// ============ ENROLLMENT TRACKING ============

// @route   GET /api/admin/courses/:courseId/enrollments
// @desc    Get enrollment details for a course
// @access  Admin
router.get('/courses/:courseId/enrollments', adminAuthMiddleware, async (req, res) => {
  try {
    const logs = await EnrollmentLog.find({ course: req.params.courseId })
      .populate('user', 'devices createdAt')
      .populate('activationCode', 'codePlain usedAt')
      .sort({ enrolledAt: -1 });

    const course = await Course.findById(req.params.courseId).select('title enrolledCount');

    res.json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        totalEnrolled: course.enrolledCount
      },
      enrollments: logs.map(log => ({
        id: log._id,
        enrolledAt: log.enrolledAt,
        lastAccessed: log.lastAccessed,
        totalWatchTime: log.totalWatchTime,
        deviceInfo: {
          fingerprint: log.deviceFingerprint,
          ipAddress: log.ipAddress,
          browser: log.browser,
          os: log.os,
          device: log.device
        },
        activationCode: log.activationCode ? {
          code: log.activationCode.codePlain,
          usedAt: log.activationCode.usedAt
        } : null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments' });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Admin
router.get('/students', adminAuthMiddleware, async (req, res) => {
  try {
    const students = await User.find()
      .populate('enrolledCourses.course', 'title')
      .populate('activationCodeId', 'codePlain')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students: students.map(s => ({
        id: s._id,
        activationCode: s.activationCodeId?.codePlain,
        enrolledCourses: s.enrolledCourses.map(e => ({
          courseId: e.course._id,
          title: e.course.title,
          progress: e.progress,
          enrolledAt: e.enrolledAt
        })),
        devices: s.devices.map(d => ({
          browser: d.browser,
          os: d.os,
          device: d.device,
          ipAddress: d.ipAddress,
          lastActive: d.lastActive
        })),
        isActive: s.isActive,
        createdAt: s.createdAt,
        lastLogin: s.lastLogin
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// ============ ADMIN SETUP ============

// @route   POST /api/admin/setup
// @desc    Create initial admin (run once)
// @access  Public (with setup key)
router.post('/setup', async (req, res) => {
  try {
    const { setupKey, username, password, name } = req.body;

    // Simple setup key protection (change in production)
    if (setupKey !== 'khaliq-setup-2024') {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ username, password, name });
    await admin.save();

    res.json({
      success: true,
      message: 'Admin created successfully',
      admin: { id: admin._id, username: admin.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin' });
  }
});

module.exports = router;
