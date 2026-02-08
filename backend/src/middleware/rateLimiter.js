import rateLimit from 'express-rate-limit';

// Rate limiter for login attempts: max 5 requests per IP per 10 minutes
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Use user IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
});

// Rate limiter for signup attempts: max 5 requests per IP per 10 minutes
export const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many signup attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
});
