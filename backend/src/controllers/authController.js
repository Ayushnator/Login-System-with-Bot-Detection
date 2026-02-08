import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import {
  FAILED_LOGIN_ATTEMPTS_THRESHOLD,
  CAPTCHA_REQUIRED_AFTER_ATTEMPTS,
  RECAPTCHA_VERIFY_URL,
} from '../config/constants.js';

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Signup Controller
 * Create new user with email, username, and password
 */
export const signup = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists.',
      });
    }

    // Create new user
    const newUser = await User.create({
      email,
      username,
      password,
    });

    console.log('User created successfully:', { id: newUser._id, email: newUser.email, username: newUser.username });

    // Generate token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message, error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error during signup. Please try again.',
    });
  }
};

/**
 * Login Controller with fail-safe and CAPTCHA requirements
 */
export const login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if CAPTCHA is required based on failed attempts
    if (user.failedLoginAttempts >= CAPTCHA_REQUIRED_AFTER_ATTEMPTS) {
      if (!recaptchaToken) {
        return res.status(403).json({
          success: false,
          requiresCaptcha: true,
          message: 'Too many failed attempts. CAPTCHA verification required.',
        });
      }

      // Verify reCAPTCHA token
      try {
        const recaptchaResponse = await axios.post(RECAPTCHA_VERIFY_URL, null, {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
          },
        });

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
          return res.status(403).json({
            success: false,
            message: 'CAPTCHA verification failed. Please try again.',
          });
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error verifying CAPTCHA. Please try again.',
        });
      }
    }

    // Compare passwords
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      user.lastFailedLoginTime = new Date();
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        requiresCaptcha:
          user.failedLoginAttempts >= CAPTCHA_REQUIRED_AFTER_ATTEMPTS,
      });
    }

    // Successful login - reset failed attempts
    user.failedLoginAttempts = 0;
    user.lastLoginTime = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during login. Please try again.',
    });
  }
};

/**
 * Get Current User
 * Protected route - requires valid JWT
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user data.',
    });
  }
};

export default {
  signup,
  login,
  getCurrentUser,
};
