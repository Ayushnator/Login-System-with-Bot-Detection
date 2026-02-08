/**
 * Application Constants
 */

export const FAILED_LOGIN_ATTEMPTS_THRESHOLD = 3;
export const CAPTCHA_REQUIRED_AFTER_ATTEMPTS = 3;

// JWT
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// reCAPTCHA
export const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export default {
  FAILED_LOGIN_ATTEMPTS_THRESHOLD,
  CAPTCHA_REQUIRED_AFTER_ATTEMPTS,
  JWT_EXPIRE,
  RECAPTCHA_VERIFY_URL,
};
