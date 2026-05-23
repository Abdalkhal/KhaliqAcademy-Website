const express = require('express');
const router = express.Router();
const { Lecture, User } = require('../models');
const { authMiddleware, courseAccessMiddleware } = require('../middleware/auth');

// @route   GET /api/quiz/:lectureId
// @desc    Get quiz questions for a lecture
// @access  Private (enrolled users)
router.get('/:lectureId', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.lectureId);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check access
    const hasAccess = req.user.enrolledCourses.some(
      e => e.course.toString() === lecture.course.toString()
    );

    if (!hasAccess && !lecture.isPreview) {
      return res.status(403).json({ message: 'No access to this quiz' });
    }

    if (!lecture.quiz || lecture.quiz.length === 0) {
      return res.status(404).json({ message: 'No quiz available for this lecture' });
    }

    // Return questions without correct answers
    const questions = lecture.quiz.map((q, index) => ({
      id: index,
      question: q.question,
      options: q.options
    }));

    res.json({
      success: true,
      lectureId: lecture._id,
      lectureTitle: lecture.title,
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// @route   POST /api/quiz/:lectureId/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:lectureId/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices
    const lecture = await Lecture.findById(req.params.lectureId);

    if (!lecture || !lecture.quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check access
    const hasAccess = req.user.enrolledCourses.some(
      e => e.course.toString() === lecture.course.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'No access' });
    }

    // Calculate score
    let correctCount = 0;
    const results = lecture.quiz.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        userAnswer: userAnswer !== undefined ? q.options[userAnswer] : 'Not answered',
        correctAnswer: q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = correctCount;
    const totalQuestions = lecture.quiz.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Save score to user
    const enrollmentIndex = req.user.enrolledCourses.findIndex(
      e => e.course.toString() === lecture.course.toString()
    );

    if (enrollmentIndex >= 0) {
      // Remove existing score for this lecture if any
      req.user.enrolledCourses[enrollmentIndex].quizScores = 
        req.user.enrolledCourses[enrollmentIndex].quizScores.filter(
          s => s.lecture.toString() !== lecture._id.toString()
        );

      req.user.enrolledCourses[enrollmentIndex].quizScores.push({
        lecture: lecture._id,
        score,
        totalQuestions,
        submittedAt: new Date()
      });

      await req.user.save();
    }

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
});

module.exports = router;
