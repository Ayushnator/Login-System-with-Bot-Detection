import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import UserDashboard from './components/UserDashboard';
import { getCurrentUser } from './services/authService';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // 'login', 'signup', or 'dashboard'
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setPage('dashboard');
        } else {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleAuthSuccess = (authType, userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    localStorage.removeItem('authToken');
  };

  const togglePage = (newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="container loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🔐 Secure Auth System</h1>
          <p>Login & Signup with Security Features</p>
        </div>
      </header>

      <main className="app-main">
        {page === 'login' && !user && (
          <div className="auth-container">
            <LoginForm onSuccess={handleAuthSuccess} />
            <div className="toggle-auth">
              <p>
                Don't have an account?{' '}
                <button className="toggle-link" onClick={() => togglePage('signup')}>
                  Create one
                </button>
              </p>
            </div>
          </div>
        )}

        {page === 'signup' && !user && (
          <div className="auth-container">
            <SignupForm onSuccess={handleAuthSuccess} />
            <div className="toggle-auth">
              <p>
                Already have an account?{' '}
                <button className="toggle-link" onClick={() => togglePage('login')}>
                  Log in
                </button>
              </p>
            </div>
          </div>
        )}

        {page === 'dashboard' && user && (
          <UserDashboard user={user} onLogout={handleLogout} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          This project demonstrates security best practices for preventing automated
          attacks and bot submissions
        </p>
      </footer>
    </div>
  );
}

export default App;
