const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Lecture, VideoToken, User } = require('../models');
const { authMiddleware, courseAccessMiddleware } = require('../middleware/auth');
const { videoLimiter } = require('../middleware/rateLimit');
const { generateVideoToken } = require('../utils/codeGenerator');

// @route   POST /api/videos/token
// @desc    Generate secure video access token
// @access  Private
router.post('/token', 
  authMiddleware, 
  videoLimiter,
  async (req, res) => {
    try {
      const { lectureId } = req.body;

      if (!lectureId) {
        return res.status(400).json({ message: 'Lecture ID required' });
      }

      const lecture = await Lecture.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found' });
      }

      // Check if user has access to this course
      const hasAccess = req.user.enrolledCourses.some(
        e => (e.course._id || e.course).toString() === lecture.course.toString()
      );

      if (!hasAccess && !lecture.isPreview) {
        return res.status(403).json({ message: 'No access to this video' });
      }

      // Generate temporary token (valid for 2 hours)
      const token = generateVideoToken();
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

      await VideoToken.create({
        token,
        lecture: lectureId,
        user: req.user._id,
        expiresAt,
        ipAddress: req.ip
      });

      res.json({
        success: true,
        token,
        expiresAt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error generating video token' });
    }
  }
);

// @route   GET /api/videos/stream/:token
// @desc    Stream video with token (secure)
// @access  Token-based (no JWT needed, token validates)
router.get('/stream/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate token
    const videoToken = await VideoToken.findOne({ token })
      .populate('lecture')
      .populate('user');

    if (!videoToken) {
      return res.status(403).json({ message: 'Invalid video token' });
    }

    if (videoToken.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Video token expired. Please refresh.' });
    }

    if (videoToken.used && videoToken.ipAddress !== ipAddress) {
      return res.status(403).json({ message: 'Token already used from different IP' });
    }

    // Mark as used
    if (!videoToken.used) {
      videoToken.used = true;
      videoToken.ipAddress = ipAddress;
      await videoToken.save();
    }

    const videoPath = videoToken.lecture.videoUrl;
    if (!videoPath || !fs.existsSync(videoPath)) {
      return res.status(404).json({ message: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ message: 'Error streaming video' });
  }
});

module.exports = router;
