import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginUser } from '../services/authService';
import '../styles/Auth.css';

const LoginForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    website: '', // Honeypot field (hidden)
  });

  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [typingDelay, setTypingDelay] = useState(0);
  const recaptchaRef = useRef();
  const formStartTime = useRef(Date.now());
  const firstInputTime = useRef(null);

  // Disable button for 2 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

    // Clear error when user starts typing
    if (error) {
      setError('');
      setErrorDetails('');
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    setLoading(true);

    // Validation
    if (!formData.email) {
      setError('⚠️ Email is required');
      setErrorDetails('Enter your registered email address');
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError('⚠️ Password is required');
      setErrorDetails('Enter your password to continue');
      setLoading(false);
      return;
    }

    // Check if CAPTCHA is required but not provided
    if (requiresCaptcha && !recaptchaToken) {
      setError('⚠️ Security verification required');
      setErrorDetails('Please complete the CAPTCHA to continue');
      setLoading(false);
      return;
    }

    // Behavioral signal: Log typing delay
    console.log(`Typing delay: ${typingDelay}ms`);

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
        recaptchaToken: recaptchaToken,
        website: formData.website, // Honeypot
      });

      if (result.success) {
        // Store token
        localStorage.setItem('authToken', result.token);
        onSuccess('login', result.user);
      } else {
        setError('❌ Login failed');
        setErrorDetails(result.message || 'Invalid email or password. Please check and try again.');

        // Check if CAPTCHA is now required
        if (result.requiresCaptcha) {
          setRequiresCaptcha(true);
          setErrorDetails('Too many failed attempts. Please complete the CAPTCHA.');
        }
      }
    } catch (err) {
      setError('❌ Error occurred');
      setErrorDetails(err.message || 'Network error. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Welcome Back!</h2>

      {error && (
        <div className="error-message">
          <div className="error-title">{error}</div>
          {errorDetails && <div className="error-details">{errorDetails}</div>}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">📧 Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="your.email@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">🔐 Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          placeholder="Enter your secure password"
        />
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

      {/* CAPTCHA - Only show if required */}
      {requiresCaptcha && (
        <div className="form-group">
          <label>Security Verification</label>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isButtonDisabled || loading}
        className="submit-btn"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="form-footer">
       
      </p>
    </form>
  );
};

export default LoginForm;
