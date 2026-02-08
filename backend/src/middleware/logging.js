import RequestLog from '../models/RequestLog.js';

/**
 * Request Logging Middleware
 * Logs authentication requests to MongoDB for monitoring and analysis
 */
export const requestLogger = async (req, res, next) => {
  // Store the original res.json to intercept responses
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Log the request after response is ready
    (async () => {
      try {
        // Only log auth endpoints
        if (req.path === '/api/auth/login' || req.path === '/api/auth/signup') {
          const status = data.success ? 'success' : 'failure';
          const reason = !data.success ? data.message : null;

          await RequestLog.create({
            ipAddress: req.ip || req.connection.remoteAddress,
            endpoint: req.path,
            method: req.method,
            userAgent: req.get('user-agent'),
            email: req.body.email || null,
            status: status,
            reason: reason,
          });
        }
      } catch (error) {
        console.error('Error logging request:', error);
      }
    })();

    return originalJson(data);
  };

  next();
};

export default requestLogger;
