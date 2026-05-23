const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for code activation attempts
const activationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    message: 'Too many activation attempts. Please contact @khaliq29 on Telegram.',
    code: 'ACTIVATION_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Video streaming limiter
const videoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    message: 'Too many video requests.',
    code: 'VIDEO_LIMIT'
  }
});

// Admin login limiter
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many login attempts. Account locked for 15 minutes.',
    code: 'LOGIN_LIMIT'
  }
});

module.exports = {
  apiLimiter,
  activationLimiter,
  videoLimiter,
  adminLoginLimiter
};
