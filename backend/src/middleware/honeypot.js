import RequestLog from '../models/RequestLog.js';

/**
 * Honeypot Middleware
 * Detects bot submissions by checking if a hidden field is filled
 * If the honeypot field is filled, the request is treated as a bot attack
 */
export const honeypotMiddleware = async (req, res, next) => {
  const honeypotField = req.body.website || '';

  if (honeypotField) {
    // Log as suspicious activity
    try {
      await RequestLog.create({
        ipAddress: req.ip || req.connection.remoteAddress,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
        email: req.body.email || null,
        status: 'suspicious',
        reason: 'Honeypot field filled - likely bot',
      });
    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }

    // Reject request silently (don't reveal honeypot mechanism)
    return res.status(400).json({
      success: false,
      message: 'Invalid request. Please try again.',
    });
  }

  next();
};

export default honeypotMiddleware;
