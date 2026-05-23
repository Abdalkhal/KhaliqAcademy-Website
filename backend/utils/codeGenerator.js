const crypto = require('crypto');

/**
 * Generate a secure random activation code
 * Format: KH-XXXX-XXXX (where X is alphanumeric)
 * Example: KH-9X2A-7LMQ
 */
const generateActivationCode = () => {
  const segments = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I, L)

  for (let i = 0; i < 2; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return `KH-${segments[0]}-${segments[1]}`;
};

/**
 * Generate device fingerprint from request
 */
const generateDeviceFingerprint = (req) => {
  const data = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.ip
  ].join('|');

  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

/**
 * Generate secure video access token
 */
const generateVideoToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash sensitive data
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  generateActivationCode,
  generateDeviceFingerprint,
  generateVideoToken,
  hashData
};
