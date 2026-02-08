import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/authController.js';
import { loginLimiter, signupLimiter } from '../middleware/rateLimiter.js';
import honeypotMiddleware from '../middleware/honeypot.js';
import authenticate from '../middleware/authentication.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Rate limited: 5 requests per IP per 10 minutes
 * Honeypot protection: hidden 'website' field
 */
router.post('/signup', signupLimiter, honeypotMiddleware, signup);

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Rate limited: 5 requests per IP per 10 minutes
 * Honeypot protection: hidden 'website' field
 * CAPTCHA: Required after 3 failed attempts
 */
router.post('/login', loginLimiter, honeypotMiddleware, login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires valid JWT in Authorization header
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
