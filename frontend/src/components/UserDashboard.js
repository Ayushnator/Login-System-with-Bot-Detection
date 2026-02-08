import React from 'react';
import { logoutUser } from '../services/authService';
import '../styles/Auth.css';

const UserDashboard = ({ user, onLogout }) => {
  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h2>Welcome, {user.username}!</h2>

        <div className="user-info">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
        </div>

        <p className="success-message">
          ✓ You have successfully logged in with a secure session.
        </p>

        <button onClick={handleLogout} className="logout-btn">
          Log Out
        </button>

        <div className="info-box">
          <h3>Security Features in Action</h3>
          <ul>
            <li>
              <strong>Rate Limiting:</strong> Limited login attempts to 5 per 10 minutes
              per IP
            </li>
            <li>
              <strong>Honeypot Protection:</strong> Hidden fields detect automated
              submissions
            </li>
            <li>
              <strong>Behavioral Analysis:</strong> Typing delays tracked to detect
              automation
            </li>
            <li>
              <strong>CAPTCHA Gate:</strong> Required after multiple failed attempts
            </li>
            <li>
              <strong>JWT Tokens:</strong> Secure authentication with token-based
              sessions
            </li>
            <li>
              <strong>Password Hashing:</strong> bcrypt ensures passwords are never
              stored in plain text
            </li>
            <li>
              <strong>Request Logging:</strong> All requests logged with IP, user-agent,
              and outcome
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
