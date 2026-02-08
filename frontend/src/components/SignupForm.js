import React, { useState, useEffect, useRef } from 'react';
import { signupUser } from '../services/authService';
import '../styles/Auth.css';

const SignupForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    website: '', // Honeypot field (hidden)
  });

  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [fieldValidation, setFieldValidation] = useState({
    email: { isValid: null, message: '' },
    username: { isValid: null, message: '' },
    password: { isValid: null, message: '' },
    confirmPassword: { isValid: null, message: '' },
  });
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [typingDelay, setTypingDelay] = useState(0);
  const formStartTime = useRef(Date.now());
  const firstInputTime = useRef(null);

  // Disable button for 2 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return { isValid: null, message: '' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
      isValid,
      message: isValid ? '✓ Valid email' : '⚠️ Invalid email format',
    };
  };

  const validateUsername = (username) => {
    if (!username) {
      return { isValid: null, message: '' };
    }
    const isValidLength = username.length >= 3 && username.length <= 20;
    const isValidChars = /^[a-zA-Z0-9_]+$/.test(username);
    const isValid = isValidLength && isValidChars;

    let message = '';
    if (!isValidLength) {
      message = '⚠️ Username must be 3-20 characters';
    } else if (!isValidChars) {
      message = '⚠️ Only letters, numbers, and underscores allowed';
    } else {
      message = '✓ Username looks good';
    }

    return { isValid, message };
  };

  const validatePassword = (password) => {
    if (!password) {
      return { isValid: null, message: '' };
    }
    const isValid = password.length >= 6;
    return {
      isValid,
      message: isValid ? '✓ Password meets requirements' : `⚠️ ${password.length}/6 characters minimum`,
    };
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return { isValid: null, message: '' };
    }
    const isValid = password === confirmPassword && password.length > 0;
    return {
      isValid,
      message: isValid ? '✓ Passwords match' : '⚠️ Passwords do not match',
    };
  };

  // Track typing behavior
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Track first keystroke delay
    if (firstInputTime.current === null && value) {
      firstInputTime.current = Date.now();
      const delay = firstInputTime.current - formStartTime.current;
      setTypingDelay(delay);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    let validation = {};
    if (name === 'email') {
      validation.email = validateEmail(value);
    } else if (name === 'username') {
      validation.username = validateUsername(value);
    } else if (name === 'password') {
      validation.password = validatePassword(value);
      validation.confirmPassword = validateConfirmPassword(value, formData.confirmPassword);
    } else if (name === 'confirmPassword') {
      validation.confirmPassword = validateConfirmPassword(formData.password, value);
    }

    setFieldValidation((prev) => ({
      ...prev,
      ...validation,
    }));

    // Clear error when user starts typing
    if (error) {
      setError('');
      setErrorDetails('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    setLoading(true);

    // Validation
    if (!formData.email) {
      setError('⚠️ Email is required');
      setErrorDetails('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!formData.username) {
      setError('⚠️ Username is required');
      setErrorDetails('Choose a unique username (3-20 characters)');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('⚠️ Password is required');
      setErrorDetails('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (!formData.confirmPassword) {
      setError('⚠️ Please confirm your password');
      setErrorDetails('Re-enter your password to verify');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('❌ Passwords do not match');
      setErrorDetails('Both password fields must be identical');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('❌ Password too short');
      setErrorDetails('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Behavioral signal: Log typing delay (for analysis)
    console.log(`Typing delay: ${typingDelay}ms`);

    try {
      const result = await signupUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        website: formData.website, // Honeypot
      });

      console.log('Signup result:', result);

      if (result.success) {
        // Store token
        localStorage.setItem('authToken', result.token);
        onSuccess('signup', result.user);
      } else {
        setError('❌ Signup failed');
        const message = result.message && typeof result.message === 'string' 
          ? result.message 
          : 'An unexpected error occurred. Please try again.';
        setErrorDetails(message);
        console.warn('Signup failed with error:', result);
      }
    } catch (err) {
      setError('❌ Error occurred');
      setErrorDetails(
        err.response?.data?.message || 
        err.message || 
        'Network error. Please check your connection and try again.'
      );
      console.error('Signup exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Create Your Account</h2>

      {error && (
        <div className="error-message">
          <div className="error-title">{error}</div>
          {errorDetails && <div className="error-details">{errorDetails}</div>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">📧 Email Address</label>
        <div className="input-with-validation">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="your.email@example.com"
            className={fieldValidation.email.isValid === true ? 'input-valid' : fieldValidation.email.isValid === false ? 'input-invalid' : ''}
          />
          {fieldValidation.email.message && (
            <span className={`validation-message ${fieldValidation.email.isValid === true ? 'valid' : 'invalid'}`}>
              {fieldValidation.email.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="username">👤 Username</label>
        <div className="input-with-validation">
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            placeholder="3-20 characters (letters, numbers, underscores)"
            className={fieldValidation.username.isValid === true ? 'input-valid' : fieldValidation.username.isValid === false ? 'input-invalid' : ''}
          />
          {fieldValidation.username.message && (
            <span className={`validation-message ${fieldValidation.username.isValid === true ? 'valid' : 'invalid'}`}>
              {fieldValidation.username.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">🔐 Password</label>
        <div className="input-with-validation">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Minimum 6 characters (mix upper, lower, numbers for security)"
            className={fieldValidation.password.isValid === true ? 'input-valid' : fieldValidation.password.isValid === false ? 'input-invalid' : ''}
          />
          {fieldValidation.password.message && (
            <span className={`validation-message ${fieldValidation.password.isValid === true ? 'valid' : 'invalid'}`}>
              {fieldValidation.password.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">✓ Confirm Password</label>
        <div className="input-with-validation">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            placeholder="Re-enter your password"
            className={fieldValidation.confirmPassword.isValid === true ? 'input-valid' : fieldValidation.confirmPassword.isValid === false && formData.confirmPassword ? 'input-invalid' : ''}
          />
          {fieldValidation.confirmPassword.message && (
            <span className={`validation-message ${fieldValidation.confirmPassword.isValid === true ? 'valid' : 'invalid'}`}>
              {fieldValidation.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      {/* Honeypot Field - Hidden from users */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={isButtonDisabled || loading}
        className="submit-btn"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>

      <p className="form-footer">
        
      </p>
    </form>
  );
};

export default SignupForm;
