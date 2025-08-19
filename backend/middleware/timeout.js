// Timeout middleware to prevent hanging requests
const timeout = (milliseconds = 30000) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      console.log(`Request timeout after ${milliseconds}ms for:`, {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: `Request took longer than ${milliseconds}ms to complete`,
          timeout: milliseconds
        });
      }
    }, milliseconds);

    // Override res.end to clear timeout
    const originalEnd = res.end;
    res.end = function(...args) {
      clearTimeout(timeoutId);
      originalEnd.apply(this, args);
    };

    // Clear timeout on response finish
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    // Clear timeout on response close
    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

module.exports = timeout;
