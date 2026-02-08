# 🔐 Secure Login System with Bot Detection

A full-stack authentication system demonstrating multiple bot detection and security hardening techniques. This project showcases engineering best practices for preventing automated attacks, credential stuffing, and fraudulent access attempts.

## 📋 Project Overview

This application implements a secure login/signup system with comprehensive bot detection mechanisms. It's designed to be simple, clean, and easy to explain in technical interviews while demonstrating professional security engineering practices.

### Key Objectives
- Build a robust authentication system with industry-standard security practices
- Implement multiple layers of bot detection
- Log and monitor suspicious activities
- Provide a clean, understandable codebase for educational and interview purposes

---

## 🎯 Features & Bot Detection Mechanisms

### 1. **Rate Limiting** (express-rate-limit)
- **Mechanism**: Limits requests per IP address
- **Configuration**: Max 5 login/signup attempts per IP every 10 minutes
- **How it works**: Prevents brute-force attacks and automated credential stuffing
- **Detection Signal**: Multiple requests from same IP in short timeframe

### 2. **Honeypot Protection**
- **Mechanism**: Hidden "website" field in forms
- **How it works**: 
  - Field is hidden from legitimate users via CSS and aria-hidden attributes
  - Bots filling the field trigger rejection
  - Request is logged as suspicious and silently rejected
- **Detection Signal**: Form submission with filled honeypot field
- **Advantage**: Doesn't alert attackers to detection

### 3. **CAPTCHA Integration** (Google reCAPTCHA v3)
- **Mechanism**: Conditional CAPTCHA challenges
- **Trigger**: Required after 3 failed login attempts
- **How it works**:
  - Tracks failed login attempts per user
  - Requires reCAPTCHA verification before further attempts
  - Score-based validation (threshold: 0.5)
- **Detection Signal**: Suspicious score patterns, multiple failed attempts

### 4. **Behavioral Analysis**
- **Typing Delay Tracking**: Monitors time from page load to first keystroke
- **Form Submission Timing**: Measures how long user spent on form
- **Use Case**: Identifies automated form fillers vs human behavior
- **Logged in Console**: Available for backend analysis

### 5. **Request Logging & Monitoring**
- **Database**: MongoDB RequestLog schema
- **Fields Logged**:
  - IP Address
  - User-Agent (browser/bot identifier)
  - Endpoint (login/signup)
  - Timestamp
  - Success/Failure/Suspicious status
  - Email (if provided)
  - Failure reason
- **Automatic Cleanup**: Logs expire after 30 days (TTL index)
- **Use Case**: Pattern detection, geographic analysis, compliance auditing

### 6. **Password Security**
- **Hashing**: bcryptjs with 10 salt rounds
- **Storage**: Passwords never logged or exposed
- **Policy**: Minimum 6 characters (can be increased)

### 7. **JWT Authentication**
- **Token Structure**: Signed with SECRET_KEY
- **Expiration**: Configurable (default 7 days)
- **Storage**: localStorage on client
- **Usage**: All authenticated requests include Authorization header

### 8. **Input Validation**
- **Email**: Regex validation for RFC-compliant format
- **Username**: Uniqueness check in database
- **Password**: Minimum length enforcement
- **Honeypot**: Explicit rejection if filled

---

## 🏗 Project Structure

```
login-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── constants.js         # Bot detection thresholds
│   │   ├── controllers/
│   │   │   └── authController.js    # Auth logic & CAPTCHA handling
│   │   ├── middleware/
│   │   │   ├── rateLimiter.js       # express-rate-limit setup
│   │   │   ├── honeypot.js          # Honeypot validation
│   │   │   ├── logging.js           # Request logging to MongoDB
│   │   │   └── authentication.js    # JWT verification
│   │   ├── models/
│   │   │   ├── User.js              # User schema with bcrypt
│   │   │   └── RequestLog.js        # Audit logging schema
│   │   ├── routes/
│   │   │   └── authRoutes.js        # API endpoints
│   │   └── server.js                # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md (backend-specific)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.js         # Login UI with CAPTCHA trigger
│   │   │   ├── SignupForm.js        # Signup UI with honeypot
│   │   │   └── UserDashboard.js     # Post-login view
│   │   ├── services/
│   │   │   └── authService.js       # API client with interceptors
│   │   ├── styles/
│   │   │   ├── App.css              # Main styling
│   │   │   └── Auth.css             # Form styling
│   │   ├── App.js                   # Root component & routing
│   │   └── index.js                 # React entry point
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── package.json
│   ├── .env.example
│   └── README.md (frontend-specific)
│
└── README.md (this file)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local instance or cloud: Atlas)
- **npm** or **yarn**
- **Google reCAPTCHA Account** (for API keys)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```
   MONGODB_URI=mongodb://localhost:27017/login-system
   JWT_SECRET=your_jwt_secret_key_here_keep_it_secure
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Windows (if MongoDB installed as service)
   net start MongoDB

   # Or run locally without service
   mongod
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:5000`
   - Health check: `GET http://localhost:5000/health`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```
   - Application opens on `http://localhost:3000`
   - Hot reload enabled for development

### Verify Installation

1. Test signup at `http://localhost:3000`
2. Check MongoDB logs via MongoDB Compass or CLI
3. Review request logs: `db.request_logs.find()` in MongoDB

---

## 🔌 API Endpoints

### Authentication Routes

All requests to these endpoints include rate limiting and honeypot protection.

#### **POST** `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "desired_username",
  "password": "password123",
  "confirmPassword": "password123",
  "website": ""  // Honeypot field (always empty)
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "desired_username"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "message": "Email or username already exists."
}
```

---

#### **POST** `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "recaptchaToken": null,  // Populated after CAPTCHA if required
  "website": ""  // Honeypot field (always empty)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "desired_username"
  }
}
```

**CAPTCHA Required Response (403):**
```json
{
  "success": false,
  "requiresCaptcha": true,
  "message": "Too many failed attempts. CAPTCHA verification required."
}
```

**Rate Limited Response (429):**
```
Standard express-rate-limit response
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: ...
```

---

#### **GET** `/api/auth/me`
Get authenticated user details (protected route).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "desired_username"
  }
}
```

**Unauthorized Response (401):**
```json
{
  "success": false,
  "message": "Invalid token. Please log in again."
}
```

---

## 🛡 Security Features Explained

### Password Hashing with bcryptjs
```javascript
// Before storage
const salt = await bcryptjs.genSalt(10);
const hashedPassword = await bcryptjs.hash(userPassword, salt);

// For comparison
const isMatch = await bcryptjs.compare(providedPassword, hashedPassword);
```
- **Why 10 rounds**: Balance between security and performance
- **Never logged**: Passwords excluded from request logs

### JWT Token Generation
```javascript
const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```
- **Expires in 7 days**: Requires re-authentication after
- **Contains user ID**: For quick identification without database query
- **Signed with secret**: Only server can generate/verify

### Failed Login Attempt Tracking
```javascript
if (user.failedLoginAttempts >= CAPTCHA_REQUIRED_AFTER_ATTEMPTS) {
  // Require CAPTCHA verification
}

// Reset on successful login
user.failedLoginAttempts = 0;
```
- **Scope**: Per-user tracking
- **Trigger**: 3+ failed attempts enable CAPTCHA
- **Reset**: Successful login resets counter

### Request Logging with TTL
```javascript
// MongoDB automatically deletes logs after 30 days
{
  timestamps: true,
  expireAfterSeconds: 2592000
}
```
- **Compliance**: Automatic data retention management
- **Performance**: Old records automatically cleaned
- **Privacy**: No indefinite logging

---

## 📊 How This Addresses "Detecting Automated Traffic"

### Core Concepts Demonstrated

1. **Rate Limiting Analysis**
   - Identifies volume-based attacks
   - Distinguishes legitimate users from bots through timing patterns
   - Example: 5 logins in 60 seconds = suspicious

2. **Behavioral Pattern Recognition**
   - Typing delay as bot indicator
   - Bots submit forms instantly; humans have natural delays
   - Tracked in console for backend statistical analysis

3. **Honeypot Technique**
   - Universal bot detection method used by major platforms
   - Bots fill ALL form fields; hidden honeypot field reveals this
   - Zero false positives (legitimate users never see it)

4. **User-Agent Analysis**
   - Logged for each request
   - Can identify bot signatures (specific headers/absence of JS features)
   - Pattern: curl/Python scripts vs browser requests

5. **CAPTCHA as Last Defense**
   - Adaptive security: Only after suspicious patterns detected
   - Score-based (reCAPTCHA v3): Doesn't interrupt users
   - Proves human interaction without interruption

6. **IP-Based Throttling**
   - Prevents distributed attacks from affecting legitimate users
   - Per-IP rate limits survive across sessions
   - Identifies proxy/VPN patterns

7. **Audit Trail**
   - Every authentication attempt logged
   - Enables post-incident analysis and pattern discovery
   - Tracks: IP, User-Agent, timestamp, success/failure
   - Geographic and behavioral analysis possible

### Example: Detecting a Bot Attack

**Scenario**: Attacker using curl to brute-force passwords

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"target@example.com","password":"guess1","website":""}'
```

**Detection Points**:
1. ✅ **Rate Limiting**: 6th request blocked (max 5 per 10 min)
2. ✅ **User-Agent**: Missing/plain "curl/..." signals bot
3. ✅ **Request Logging**: IP flagged after 3+ failures
4. ✅ **Timing Pattern**: Requests arrive 1/second (humans slower)
5. ✅ **Failed Attempts**: User flagged, CAPTCHA required

**Logged Evidence** (in request_logs):
```json
{
  "ipAddress": "192.168.1.100",
  "userAgent": "curl/7.64.1",
  "email": "target@example.com",
  "endpoint": "/api/auth/login",
  "status": "failure",
  "reason": "Invalid email or password.",
  "timestamp": "2026-02-08T10:15:32.000Z"
}
```

---

## 🧪 Testing the Features

### Test 1: Honeypot Protection
```javascript
// This would trigger bot detection
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    website: 'https://spambot.com'  // Honeypot filled!
  })
});
// Response: 400 "Invalid request. Please try again."
// Logged as: status: 'suspicious', reason: 'Honeypot field filled'
```

### Test 2: Rate Limiting
```bash
# Run 6 times in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong","website":""}'
done

# Response on 6th request: 429 Too Many Requests
```

### Test 3: Behavioral Signals
1. Open form and immediately start typing
2. Check browser console for typing delay
3. Example: `Typing delay: 450ms` (human-like)

### Test 4: CAPTCHA Trigger
1. Login with wrong password 3+ times
2. Next login attempt shows CAPTCHA
3. Successful CAPTCHA resets counter
4. User can login normally again

### Test 5: Request Logging
```javascript
// Query MongoDB
db.request_logs.find({ email: 'user@example.com' }).pretty()

// Results show:
// - All login attempts
// - Success/failure status
// - IP address
// - User-Agent
// - Timestamp
```

---

## 📈 Performance & Scalability Considerations

1. **Database Indexing**
   - User email and username indexed for fast lookups
   - RequestLog IP + timestamp indexed for quick filtering

2. **Token Validation**
   - JWT verification is fast (no database query)
   - ID stored in token for optional user context

3. **Rate Limit Storage**
   - express-rate-limit uses memory store by default
   - For production: switch to Redis store
   - Example config provided in code comments

4. **Log Cleanup**
   - Automatic TTL index on RequestLog collection
   - Configurable expiration (currently 30 days)
   - No manual cleanup required

---

## 🔧 Development & Customization

### Adjust Bot Detection Thresholds
Edit [backend/src/config/constants.js](backend/src/config/constants.js):
```javascript
export const FAILED_LOGIN_ATTEMPTS_THRESHOLD = 3; // Trigger CAPTCHA after this many failures
export const MAX_FAILED_ATTEMPTS_BEFORE_LOCKOUT = 10; // Account lockout threshold
export const LOCKOUT_TIME_MINUTES = 15; // Duration of account lockout
```

### Modify Rate Limiting
Edit [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js):
```javascript
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // Time window
  max: 5,                     // Max requests per window
});
```

### Change Password Requirements
Edit [backend/src/controllers/authController.js](backend/src/controllers/authController.js):
```javascript
if (password.length < 6) {  // Change minimum length
  // ...
}
```

---

## 📚 Dependencies Overview

### Backend
- **express** (4.18.2): HTTP server framework
- **mongoose** (7.5.0): MongoDB object modeling
- **bcryptjs** (2.4.3): Password hashing
- **jsonwebtoken** (9.1.0): JWT token management
- **express-rate-limit** (7.1.1): Rate limiting middleware
- **axios** (1.5.0): HTTP client for reCAPTCHA verification
- **morgan** (1.10.0): HTTP request logging

### Frontend
- **react** (18.2.0): UI framework
- **react-dom** (18.2.0): React DOM rendering
- **react-google-recaptcha** (3.1.0): reCAPTCHA component
- **axios** (1.5.0): HTTP client for API calls

---

## 🎓 Interview Talking Points

1. **Rate Limiting Strategy**
   - "Prevents brute-force attacks by limiting requests per IP"
   - Mention scalability: would use Redis for distributed systems

2. **Honeypot Advantages**
   - "Silent rejection without alerting attackers"
   - Zero false positives on legitimate users

3. **Behavioral Analysis**
   - "Bots exhibit different timing patterns than humans"
   - Typing delay as supplementary signal

4. **CAPTCHA Placement**
   - "Only triggered after suspicious activity to maintain UX"
   - Reduces friction for legitimate users

5. **Audit Logging**
   - "Every attempt logged for post-incident analysis and pattern detection"
   - Enables geographic and behavioral analysis

6. **Security by Layers**
   - "Defense in depth: rate limiting, honeypot, CAPTCHA, logging"
   - Single bypass doesn't compromise system

---

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Obtain real reCAPTCHA keys from Google
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed database
- [ ] Switch rate limiter to Redis store
- [ ] Enable HTTPS/TLS on all endpoints
- [ ] Implement CORS whitelist for frontend domain
- [ ] Add request validation and sanitization
- [ ] Implement refresh token strategy
- [ ] Add logging to external service (e.g., Sentry)
- [ ] Set up monitoring and alerting for suspicious patterns
- [ ] Conduct security audit and penetration testing

---

## 📝 License

MIT

---

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for learning purposes.

---

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review code comments
3. Examine example requests in this README
4. Check backend logs and MongoDB request_logs

---

**Built with focus on security, simplicity, and educational value.**
