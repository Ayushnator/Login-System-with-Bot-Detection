# Implementation Verification & Testing Guide

## ✅ Pre-Flight Checklist

Before starting, verify these prerequisites:

- [ ] Node.js v14+ installed
  ```bash
  node --version  # Should show v14.0.0 or higher
  npm --version   # Should show npm 6.0.0 or higher
  ```

- [ ] MongoDB running
  ```bash
  # Check if MongoDB is accessible
  mongod --version
  ```

- [ ] Git (optional but recommended)
  ```bash
  git --version
  ```

- [ ] All files created in correct structure
  ```bash
  # From loginsystem directory
  ls backend/src/  # Should show config, controllers, middleware, models, routes
  ls frontend/src/ # Should show components, services, styles
  ```

---

## 🚀 Installation Verification

### Backend Setup Checklist

```bash
cd backend

# [ ] Dependencies installed
npm install
# Expected: ✓ 9 packages installed successfully

# [ ] .env file created
cp .env.example .env
# Edit .env with your MongoDB connection string

# [ ] Check main entry point exists
test -f src/server.js && echo "✓ server.js exists"

# [ ] Check all required directories exist
test -d src/config && echo "✓ config/"
test -d src/controllers && echo "✓ controllers/"
test -d src/middleware && echo "✓ middleware/"
test -d src/models && echo "✓ models/"
test -d src/routes && echo "✓ routes/"
```

### Frontend Setup Checklist

```bash
cd frontend

# [ ] Dependencies installed
npm install
# Expected: ✓ X packages installed successfully

# [ ] .env file created
cp .env.example .env
# Edit .env with REACT_APP_API_URL and REACT_APP_RECAPTCHA_SITE_KEY

# [ ] Check main entry point exists
test -f src/index.js && echo "✓ index.js exists"
test -f public/index.html && echo "✓ index.html exists"

# [ ] Check all required directories exist
test -d src/components && echo "✓ components/"
test -d src/services && echo "✓ services/"
test -d src/styles && echo "✓ styles/"
```

---

## 🧪 Functional Testing

### Test 1: Basic Server Health

```bash
# Terminal: Backend directory
npm run dev

# Terminal: Another tab
curl http://localhost:5000/health

# Expected Response:
# {"status":"Server is running"}

# ✓ If you see this, backend is working
# ✗ If connection refused, check port in .env
```

### Test 2: Frontend Loads

```bash
# Terminal: Frontend directory
npm start

# Expected:
# - Browser opens to http://localhost:3000
# - No console errors
# - Login form visible
# - "Secure Login System" header visible

# ✓ If you see login form, frontend is working
# ✗ If blank page, check console (F12) for errors
```

### Test 3: MongoDB Connection

```bash
# Terminal: Any directory with mongo access
mongo
# or
mongosh

# In MongoDB shell:
use login-system
db.users.countDocuments()
# Expected: { n: 0 }  (or higher if data exists)

# ✓ If you see count, MongoDB is connected
# ✗ If error, check MONGODB_URI in .env
```

---

## 🔒 Security Feature Testing

### Test 4: Honeypot Protection

**Test honeypot field rejection:**

```bash
# Using curl:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "website": "https://spam-bot.com"
  }'

# Expected Response (400):
# {"success":false,"message":"Invalid request. Please try again."}

# ✓ If you get 400 "Invalid request", honeypot is working
# ✗ If you get different response, check honeypot middleware

# Check MongoDB for suspicious log:
db.request_logs.findOne({ status: "suspicious" })
# ✓ Should show reason: "Honeypot field filled - likely bot"
```

### Test 5: Rate Limiting

**Test rate limit enforcement:**

```bash
# Run this command 6 times in quick succession:
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done

# Expected:
# Requests 1-5: 401 (Unauthorized - wrong password)
# Request 6: 429 (Too Many Requests)

# ✓ If 6th request is 429, rate limiting is working
# ✗ If all return 401, rate limiter not applied

# Check rate limit headers:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  -v  # -v shows headers

# Expected headers:
# RateLimit-Limit: 5
# RateLimit-Remaining: 4  (decreases with each request)
# RateLimit-Reset: ...
```

### Test 6: Password Hashing

**Verify passwords are NOT stored in plain text:**

```bash
# In MongoDB:
use login-system

# First, create a user via signup form or API
# Then:
db.users.findOne({ email: "test@example.com" })

# Expected:
# password: "$2a$10$..." (bcrypt hash, starts with $2a)

# ✓ If password is a long hash starting with $2a, hashing is working
# ✗ If password is plain text, bcryptjs not applied
```

### Test 7: JWT Token Generation

**Verify JWT tokens are created and returned:**

```bash
# Sign up or login (via web form or API)
# In response, look for "token" field

# Example:
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser123",
    "password": "password123",
    "confirmPassword": "password123",
    "website": ""
  }'

# Response should include:
# "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTc5..."

# Verify token at https://jwt.io
# ✓ If payload shows { id, email }, JWT working
# ✗ If error decoding, check JWT_SECRET in .env
```

### Test 8: Protected Routes

**Test that /api/auth/me requires valid JWT:**

```bash
# Without token:
curl http://localhost:5000/api/auth/me

# Expected (401):
# {"success":false,"message":"No token provided. Authentication required."}

# With invalid token:
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/api/auth/me

# Expected (401):
# {"success":false,"message":"Invalid token. Please log in again."}

# With valid token (from signup/login):
curl -H "Authorization: Bearer VALID_JWT_HERE" \
  http://localhost:5000/api/auth/me

# Expected (200):
# {"success":true,"user":{"id":"...","email":"...","username":"..."}}

# ✓ If you get 401 without token, protected routes working
# ✗ If you get 200 without token, authentication not enforced
```

### Test 9: Failed Login Attempt Tracking

**Test CAPTCHA trigger after 3 failed attempts:**

```bash
# Sign up a test user first:
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "captcha-test@example.com",
    "username": "captchatest",
    "password": "correctpassword",
    "confirmPassword": "correctpassword",
    "website": ""
  }'

# Now attempt login with wrong password 4 times:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "captcha-test@example.com",
    "password": "wrongpassword",
    "website": ""
  }' | jq .

# Request 1-3: Should return:
# {"success":false,"message":"Invalid email or password."}

# Request 4: Should return:
# {"success":false,"requiresCaptcha":true,"message":"Too many failed attempts..."}

# ✓ If 4th response has requiresCaptcha: true, tracking working
# ✗ If no requiresCaptcha, check constants.js CAPTCHA_REQUIRED_AFTER_ATTEMPTS
```

### Test 10: Request Logging to MongoDB

**Verify all requests are logged:**

```bash
# Make some auth requests (signup, login, wrong password, etc.)

# Then query MongoDB:
use login-system
db.request_logs.countDocuments()

# Should show > 0 logs

db.request_logs.find({}).limit(5).pretty()

# Each log should have:
# - ipAddress: "::1" or "127.0.0.1"
# - endpoint: "/api/auth/login" or "/api/auth/signup"
# - method: "POST"
# - userAgent: browser/curl user agent
# - status: "success" or "failure"
# - timestamp: current date

# ✓ If logs appear in MongoDB, logging working
# ✗ If no logs, check logging middleware
```

---

## 🎯 Frontend-Specific Tests

### Test 11: Honeypot Field Hidden

**Verify honeypot field is invisible:**

```javascript
// In browser console on login/signup page:
document.querySelector('[name="website"]')
// Should return: <input type="text" name="website"> (exists but hidden)

// Check it's hidden:
const honeypot = document.querySelector('[name="website"]');
const style = window.getComputedStyle(honeypot);
console.log(style.display);  // Should be "none"
```

### Test 12: Button Disable on Load

**Verify submit button disabled for 2 seconds:**

1. Go to http://localhost:3000
2. Immediately try to click "Sign Up" or "Log In" button
3. Button should be disabled (greyed out, can't click)
4. Wait 2 seconds
5. Button becomes enabled (can click)

✓ If button is disabled initially then enabled, working
✗ If button always enabled, check useEffect in components

### Test 13: Typing Delay Tracking

**Verify typing delay is logged:**

```javascript
// In browser console on login page:
1. Fill in email field
2. Open DevTools Console tab
3. Look for: "Typing delay: Xms"

// Expected:
// Typing delay: 450ms  (human-like delay)

// ✓ If you see timing, tracking working
// ✗ If no message, check handleInputChange in components
```

### Test 14: CAPTCHA Display

**Test CAPTCHA shows only when required:**

1. Go to http://localhost:3000 > Login
2. Enter a test user email with 3+ failed attempts
3. Try to login with wrong password
4. CAPTCHA widget should appear
5. Correct password login without CAPTCHA required

✓ If CAPTCHA appears only after failures, working
✗ If CAPTCHA always shows, check requiresCaptcha state logic

### Test 15: Login Success Flow

**Test complete login success path:**

1. Go to http://localhost:3000
2. Click "Create an account"
3. Fill: email, username, password (6+ chars)
4. Click "Sign Up"
5. Should see dashboard with user info
6. Check localStorage for token:
   ```javascript
   localStorage.getItem('authToken')
   // Should return jwt token string
   ```
7. Logout button works and clears token

✓ If you reach dashboard, signup/login working
✗ Check backend logs and browser console for errors

---

## 📊 Integration Tests

### Test 16: Full User Journey

```
1. [ ] Signup new user
   - Email, username, password entered
   - Form submitted
   - User created in MongoDB
   - JWT token returned
   - Dashboard displayed

2. [ ] Logout and login
   - Logout clicked
   - Token cleared
   - Redirected to login
   - Login with same credentials
   - Dashboard shows again

3. [ ] Attempt duplicate signup
   - Try to signup with same email/username
   - Error message shown
   - User not duplicated in MongoDB

4. [ ] Wrong password login
   - Login with correct email, wrong password
   - Error message shown (not "logged in")
   - failedLoginAttempts incremented
   - After 3 failures, CAPTCHA required

5. [ ] Honeypot caught bot
   - Fill honeypot (via JS in console)
   - Submit form
   - 400 error returned
   - Logged as suspicious in MongoDB
```

### Test 17: MongoDB Data Validation

```bash
# Check users collection structure:
db.users.findOne()

# Should have fields:
# - _id (ObjectId)
# - email (string, unique)
# - username (string, unique)
# - password (bcrypt hash)
# - failedLoginAttempts (number)
# - lastFailedLoginTime (date or null)
# - lastLoginTime (date or null)
# - createdAt (date)
# - updatedAt (date)

# Check request_logs structure:
db.request_logs.findOne()

# Should have fields:
# - _id (ObjectId)
# - ipAddress (string)
# - endpoint (string)
# - method (string)
# - userAgent (string)
# - email (string or null)
# - status (string: success/failure/suspicious)
# - reason (string or null)
# - timestamp (date)

# ✓ If both collections exist and have correct fields
```

---

## 🐛 Debugging Guide

### Issue: Port Already in Use

```bash
# Check what's using the port:
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process or change PORT in .env
```

### Issue: MongoDB Connection Failed

```bash
# Check MongoDB is running:
# Windows (if service):
Get-Service mongodb

# Start MongoDB:
# macOS with Homebrew:
brew services start mongodb-community

# Start manually:
mongod
```

### Issue: CORS Errors

```bash
# Check backend .env:
FRONTEND_URL=http://localhost:3000

# Check frontend .env:
REACT_APP_API_URL=http://localhost:5000/api

# Check browser console for specific error
# Should show: "Access-Control-Allow-Origin" error
```

### Issue: 500 Internal Server Error

```bash
# Check backend console for error stacktrace
# Common causes:
# - MongoDB not connected
# - JWT_SECRET missing
# - RECAPTCHA_SECRET_KEY missing
# - Mongoose schema error

# Check backend logs:
# Terminal where `npm run dev` is running should show:
# "MongoDB Connected: ..."
# If not, configure MONGODB_URI
```

### Issue: Form Won't Submit

```javascript
// Open browser console (F12)
// Check for JavaScript errors
// Common issues:
// 1. Network tab shows 429 (rate limited)
// 2. Network tab shows connection refused (backend down)
// 3. Submit button disabled by honeypot (impossible via UI)
// 4. Form validation blocking submission
```

---

## ✨ Success Indicators

When everything is working correctly, you should see:

- ✅ Backend server starts without errors
- ✅ Frontend loads without console errors
- ✅ MongoDB connected to backend
- ✅ Signup creates user in database
- ✅ Login returns JWT token
- ✅ JWT token stored in localStorage
- ✅ Protected route needs token
- ✅ Failed logins tracked per user
- ✅ 6th request within rate limit window returns 429
- ✅ Honeypot filled = request rejected
- ✅ 3+ failed logins trigger CAPTCHA requirement
- ✅ All requests logged to MongoDB
- ✅ Dashboard shows user info after login
- ✅ Logout clears token and redirects
- ✅ Typing delay logged in console
- ✅ Submit button disabled 2 seconds after page load

---

## 📝 Logging Output Examples

### Expected Backend Console Output:

```
Server running on port 5000
MongoDB Connected: localhost
POST /api/auth/signup 201 45ms
POST /api/auth/login 200 32ms
POST /api/auth/login 429 2ms
GET /api/auth/me 200 15ms
```

### Expected Browser Console Output:

```
Typing delay: 523ms
```

### Expected MongoDB Logs:

```javascript
// request_logs example
{
  "_id": ObjectId(...),
  "ipAddress": "::1",
  "endpoint": "/api/auth/login",
  "method": "POST",
  "userAgent": "Mozilla/5.0...",
  "email": "user@example.com",
  "status": "success",
  "reason": null,
  "timestamp": ISODate("2026-02-08T10:15:30.000Z")
}

// users example
{
  "_id": ObjectId(...),
  "email": "user@example.com",
  "username": "username123",
  "password": "$2a$10$...", // bcrypt hash
  "failedLoginAttempts": 0,
  "lastFailedLoginTime": null,
  "lastLoginTime": ISODate("2026-02-08T10:15:30.000Z"),
  "createdAt": ISODate("2026-02-08T10:10:20.000Z"),
  "updatedAt": ISODate("2026-02-08T10:15:30.000Z")
}
```

---

## ✅ Fix-and-Verify Workflow

If a test fails:

1. **Identify** which component (backend/frontend/db) is involved
2. **Check logs** (browser console, backend terminal, MongoDB)
3. **Verify configuration** (.env files have correct values)
4. **Review code** (check relevant source files)
5. **Fix** (update code or config)
6. **Test again** (run test from this guide)
7. **Verify** (related tests also still pass)

---

**Now you're ready to test!** Start with Test 1 and work through systematically.
