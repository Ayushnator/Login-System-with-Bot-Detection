# Secure Login System - Frontend

React-based frontend with integrated bot detection features and responsive design.

## Features

- **Login & Signup Forms** with validation
- **JWT Token Management** and authentication
- **Honeypot Field** protection (hidden from users)
- **Google reCAPTCHA v3** integration
- **Behavioral Signals** (typing delay tracking)
- **Button Disabling** for 2 seconds on page load
- **User Dashboard** with secure session display
- **Responsive Design** for mobile and desktop

## Components

- **LoginForm.js**: Login interface with CAPTCHA support
- **SignupForm.js**: User registration form with password validation
- **UserDashboard.js**: Post-authentication view
- **authService.js**: API client with interceptors

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

## Installation & Running

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm start

# Application opens at http://localhost:3000
```

## Bot Detection Features Implemented

1. **Honeypot Protection**
   - Hidden "website" field in forms
   - Bots filling it triggers rejection
   - Completely transparent to legitimate users

2. **Behavioral Signals**
   - Typing delay from page load to first keystroke
   - Logged in console for backend analysis
   - Identifies instant form submissions (bot behavior)

3. **Button Disable on Load**
   - Disables submit button for 2 seconds after page load
   - Prevents instant automated submissions
   - Transparent to users who think it's loading

4. **CAPTCHA Trigger**
   - Only shown after 3+ failed login attempts
   - Uses Google reCAPTCHA v3 (non-intrusive)
   - Score-based validation (threshold: 0.5)

## Project Structure

```
src/
├── components/
│   ├── LoginForm.js      # Login UI with CAPTCHA
│   ├── SignupForm.js     # Signup UI with honeypot
│   └── UserDashboard.js  # Authenticated user view
├── services/
│   └── authService.js    # API client
├── styles/
│   ├── App.css           # Main styling
│   └── Auth.css          # Form styling
├── App.js                # Root component
└── index.js              # React entry point

public/
└── index.html            # HTML template
```

## API Integration

The frontend communicates with the backend at:
- Default: `http://localhost:5000/api`
- Configurable via `REACT_APP_API_URL` environment variable

### Endpoints Used

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Fetch current user (protected)

## Security Features

1. **Token Storage**: JWT stored in localStorage
2. **Authorization Header**: Token sent with all authenticated requests
3. **Error Handling**: Silent rejection of invalid requests
4. **Input Validation**: Email, password length checks
5. **CORS**: Requests restricted to backend domain

## Development Tips

- Open browser DevTools console to see typing delays
- Form errors displayed in red boxes
- Successful login redirects to dashboard
- Logout clears token and returns to login

## How Honeypot Works

The hidden "website" field:
```jsx
<div style={{ display: 'none' }} aria-hidden="true">
  <input type="text" name="website" />
</div>
```

- Not visible to humans
- Invisible to keyboard navigation (`tabIndex="-1"`)
- Bots filling it reveal themselves
- Request rejected before reaching backend

## Building for Production

```bash
npm run build
```

Creates optimized build in `/build` directory ready for deployment.

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

See [../README.md](../README.md) for complete project documentation and bot detection strategy explanation.
