const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max 500MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message === 'DEVICE_LIMIT_REACHED') {
    return res.status(403).json({
      message: 'Maximum device limit reached (2 devices). Contact @khaliq29 on Telegram.',
      code: 'DEVICE_LIMIT'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
