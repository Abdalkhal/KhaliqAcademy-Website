const express = require('express');
const router = express.Router();
const { Course, Lecture, User, EnrollmentLog } = require('../models');
const { authMiddleware, courseAccessMiddleware } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all published courses (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select('-lectures')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.shortDescription || (course.description ? course.description.substring(0, 150) + '...' : ''),
        price: course.price,
        currency: course.currency,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        lectureCount: course.lectureCount || 0,
        enrolledCount: course.enrolledCount,
        featured: course.featured
      }))
    });
  } catch (error) {
    require('fs').writeFileSync('error.log', error.stack || String(error));
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course details (public preview)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lectures', 'title description order isPreview videoDuration');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Public info - hide sensitive data
    const publicLectures = course.lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      order: lecture.order,
      isPreview: lecture.isPreview,
      duration: lecture.videoDuration,
      hasQuiz: false // Will be updated if quiz exists
    }));

    res.json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        price: course.price,
        currency: course.currency,
        thumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        lectureCount: course.lectures.length,
        totalDuration: course.totalDuration,
        enrolledCount: course.enrolledCount,
        lectures: publicLectures,
        isPublished: course.isPublished
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course' });
  }
});

// @route   GET /api/courses/:id/content
// @desc    Get full course content (requires access)
// @access  Private (activated users only)
router.get('/:id/content', 
  authMiddleware, 
  courseAccessMiddleware('id'),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate({
          path: 'lectures',
          select: 'title description order videoDuration quiz resources isPreview'
        });

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Get user's progress for this course
      const enrollment = req.user.enrolledCourses.find(
        e => e.course._id.toString() === req.params.id
      );

      const lecturesWithProgress = course.lectures.map(lecture => {
        const isCompleted = enrollment?.completedLectures?.includes(lecture._id);
        const quizScore = enrollment?.quizScores?.find(
          q => q.lecture.toString() === lecture._id.toString()
        );

        return {
          id: lecture._id,
          title: lecture.title,
          description: lecture.description,
          order: lecture.order,
          isPreview: lecture.isPreview,
          duration: lecture.videoDuration,
          isCompleted: !!isCompleted,
          quizScore: quizScore ? {
            score: quizScore.score,
            total: quizScore.totalQuestions
          } : null,
          hasQuiz: lecture.quiz && lecture.quiz.length > 0,
          quizCount: lecture.quiz ? lecture.quiz.length : 0,
          resources: lecture.resources || []
        };
      });

      // Update last accessed
      await EnrollmentLog.findOneAndUpdate(
        { user: req.user._id, course: req.params.id },
        { lastAccessed: new Date() }
      );

      res.json({
        success: true,
        course: {
          id: course._id,
          title: course.title,
          lectures: lecturesWithProgress,
          progress: enrollment?.progress || 0
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching course content' });
    }
  }
);

// @route   GET /api/courses/:id/enrollment
// @desc    Get enrollment details and devices
// @access  Private
router.get('/:id/enrollment', authMiddleware, async (req, res) => {
  try {
    const enrollment = req.user.enrolledCourses.find(
      e => e.course.toString() === req.params.id
    );

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const log = await EnrollmentLog.findOne({
      user: req.user._id,
      course: req.params.id
    });

    res.json({
      success: true,
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        devices: req.user.devices,
        lastAccessed: log?.lastAccessed,
        totalWatchTime: log?.totalWatchTime || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment' });
  }
});

module.exports = router;
