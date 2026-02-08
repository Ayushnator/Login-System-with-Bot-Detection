# System Architecture & Flow

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTIONS                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                 SIGNUP          LOGIN         LOGOUT
                    │              │              │
┌─────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND                                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ SignupForm   │    │  LoginForm   │    │  Dashboard   │              │
│  ├──────────────┤    ├──────────────┤    │              │              │
│  │ Honeypot ✓   │    │ Honeypot ✓   │    │ User Info    │              │
│  │ Typing Delay │    │ Typing Delay │    │ Logout Btn   │              │
│  │ Button Delay │    │ Button Delay │    │ Features List│              │
│  │ Validation   │    │ Validation   │    │              │              │
│  │              │    │ CAPTCHA ?    │    │              │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                    │                    │                     │
│         │                    │                    │                     │
│  ┌──────────────────────────────────────────────────┐                  │
│  │          authService.js (API Client)             │                  │
│  │  - Token management (localStorage)               │                  │
│  │  - Axios interceptors                            │                  │
│  │  - Error handling                                │                  │
│  └──────────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   │               │               │
                POST /signup   POST /login   GET /me
                   │               │               │
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND MIDDLEWARE STACK                     │
│                                                                          │
│  1. CORS Middleware                                                     │
│     └─ Allow frontend to communicate                                    │
│                                                                          │
│  2. Parser Middleware (json/urlencoded)                                │
│     └─ Parse request body                                               │
│                                                                          │
│  3. Morgan Logging Middleware                                           │
│     └─ Log HTTP requests to console                                     │
│                                                                          │
│  4. Rate Limiter Middleware (signupLimiter / loginLimiter)             │
│     ├─ Max 5 requests per IP per 10 minutes                             │
│     └─ Return 429 if exceeded                                           │
│                                                                          │
│  5. Honeypot Middleware                                                 │
│     ├─ Check if hidden 'website' field filled                           │
│     ├─ If filled: log as suspicious & reject                           │
│     └─ If empty: continue                                               │
│                                                                          │
│  6. Request Logger Middleware                                           │
│     ├─ Intercept response                                               │
│     └─ Log to MongoDB (async, non-blocking)                            │
│                                                                          │
│  7. Route Handler (Controller)                                          │
│     ├─ Use Controller function (signup/login/getCurrentUser)           │
│     └─ Controller executes main logic                                   │
│                                                                          │
│  8. Authentication Middleware (for protected routes)                    │
│     ├─ Extract JWT from Authorization header                            │
│     ├─ Verify token signature                                           │
│     └─ Set req.userId if valid                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   │               │               │
                SIGNUP          LOGIN            ME
                   │               │               │
┌─────────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LOGIC                                    │
│                                                                          │
│  SIGNUP FLOW:                    LOGIN FLOW:         ME FLOW:          │
│  1. Validate input               1. Validate input   1. Get userId      │
│  2. Check duplicates             2. Find user        2. Query user      │
│  3. Hash password                3. Compare pwd              │          │
│  4. Create user                  4. Check captcha?          └─→ Return  │
│  5. Generate JWT                 5. Verify reCAPTCHA                   │
│  6. Return token ✓               6. Track attempts                      │
│                                  7. Reset attempts                      │
│                                  8. Generate JWT ✓                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                 │                    │                    │
    ┌────────────┴────────────┐       │       ┌────────────┴───────────┐
    │                         │       │       │                        │
    ▼                         ▼       ▼       ▼                        ▼
┌──────────────────┐   ┌──────────────────┐  ┌──────────────────────────┐
│   MONGODB: USERS │   │ MONGODB: LOGGING │  │  GOOGLE reCAPTCHA API    │
│ ┌──────────────┐ │   │ ┌──────────────┐ │  │ (Score verification)     │
│ │ id/email     │ │   │ │ ipAddress    │ │  │                          │
│ │ username     │ │   │ │ endpoint     │ │  │ Only called if needed    │
│ │ password     │ │   │ │ userAgent    │ │  │                          │
│ │ failedAttmpts│ │   │ │ timestamp    │ │  │                          │
│ │ lastLogin    │ │   │ │ status       │ │  │                          │
│ │              │ │   │ │ reason       │ │  │                          │
│ └──────────────┘ │   │ └──────────────┘ │  │                          │
│                  │   │ (TTL: 30 days)   │  │                          │
└──────────────────┘   └──────────────────┘  └──────────────────────────┘
```

---

## Bot Detection Layers

```
REQUEST ARRIVES
    │
    ▼
┌─────────────────────────────────┐
│  LAYER 1: RATE LIMITING         │
│  ┌─────────────────────────────┐│
│  │ IP Address Check            ││
│  │ - 5 requests per 10 minutes  ││
│  │ - Block if exceeded (429)    ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
            │
      ┌─────┴─────┐
      │           │
    PASS        FAIL
      │           │
      ▼           ▼
     │    (Rate Limit
      │     Response)
      │
      ▼
┌─────────────────────────────────┐
│  LAYER 2: HONEYPOT              │
│  ┌─────────────────────────────┐│
│  │ Check hidden 'website' field ││
│  │ - Empty = continue           ││
│  │ - Filled = Bot detected      ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
            │
      ┌─────┴─────┐
      │           │
    PASS        FAIL
      │           │
      ▼           ▼
     │   (Silent Rejection
      │    + Log "suspicious")
      │
      ▼
┌─────────────────────────────────┐
│  LAYER 3: BEHAVIORAL ANALYSIS   │
│  ┌─────────────────────────────┐│
│  │ Typing Delay                ││
│  │ - 0-500ms = suspicious       ││
│  │ - 500ms+ = human-like        ││
│  │ (Informational, not blocking)││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
            │
      ▼ (Pass through - logged for analysis)

┌─────────────────────────────────┐
│  LAYER 4: LOGIN-SPECIFIC        │
│  ┌─────────────────────────────┐│
│  │ Failed Attempt Tracking     ││
│  │ - 1-2 failures: normal      ││
│  │ - 3+ failures: require CAPTCHA││
│  │ - Reset on success          ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
            │
      ┌─────┴──────┐
      │            │
    <3 fails    3+ fails
      │            │
      ▼            ▼
   Continue    CAPTCHA Required
      │            │
      ▼            ▼
   LOGIN      ┌──────────────────┐
   ATTEMPT    │ Verify reCAPTCHA │
              │ - Score < 0.5    │
              │ - Reject         │
              └──────────────────┘
                     │
                ┌────┴────┐
                │         │
              PASS      FAIL
                │         │
                ▼         ▼
          Continue    Reject

┌─────────────────────────────────┐
│  LAYER 5: REQUEST LOGGING       │
│  ┌─────────────────────────────┐│
│  │ Every request logged:        ││
│  │ - IP, User-Agent, Timestamp ││
│  │ - Success/Failure/Suspicious││
│  │ - Email & endpoint          ││
│  │ → MongoDB (async)            ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
            │
            ▼
     PATTERN ANALYSIS
   (Post-incident forensics)
```

---

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                    React App.js                          │
│                                                          │
│  State:                                                 │
│  - currentPage: 'login' | 'signup' | 'dashboard'        │
│  - user: null | { id, email, username }                 │
│  - loading: boolean                                     │
│                                                          │
│  useEffect (on mount):                                  │
│  - Check localStorage for JWT token                     │
│  - Call getCurrentUser() if token exists                │
│  - Set user state & show dashboard                      │
│  - Clear loading state                                  │
└──────────────────────────────────────────────────────────┘
              │                           │
              │                           │
  ┌───────────┴──────────┐      ┌────────┴──────────┐
  │                      │      │                   │
  ▼                      ▼      ▼                   ▼
Login/Signup Routes   Protected Routes    localStorage   Browser
(LoginForm)           (API calls)         (JWT token)     localStorage
  │                      │                   │                │
  └──────────┬───────────┘                   │                │
             │                               │                │
   ┌─────────▼──────────────┐               │                │
   │ authService.js         │               │                │
   │ ├─ signupUser()        │               │                │
   │ ├─ loginUser()         │               │                │
   │ ├─ getCurrentUser()    │────────────────┴────────────────┤
   │ └─ logoutUser()        │                                 │
   │     └─ Clear token     │────────────────┬────────────────┘
   └─────────┬──────────────┘                │
             │                               │
             ▼                               ▼
        Backend API                    localStorage cleared
     (Express with JWT)                User redirected to login
```

---

## Data Flow: Signup Example

```
1. USER INTERACTION
   └─ Fill form: email, username, password, confirmPassword
      └─ Honeypot 'website' field (hidden, empty)

2. ON SUBMIT
   └─ preventDefault()
   └─ Client-side validation (passwords match, length ≥ 6)
   └─ Typing delay calculation
   └─ API call: POST /api/auth/signup

3. BACKEND RECEIVES REQUEST
   └─ Express middleware stack executes:
      ├─ CORS check ✓
      ├─ JSON parse ✓
      ├─ Morgan logging ✓
      ├─ signupLimiter (rate limit check) ✓
      ├─ honeypotMiddleware (website field check) ✓
      └─ authController.signup() executes
         ├─ Validate all fields provided ✓
         ├─ Validate password ≥ 6 chars ✓
         ├─ Check email unique ✓
         ├─ Check username unique ✓
         ├─ Pre-save hook: hash password with bcryptjs
         │  └─ 10 salt rounds (~100ms)
         ├─ Save user to MongoDB
         ├─ Generate JWT token
         └─ Return success response

4. RESPONSE MIDDLEWARE
   └─ requestLogger intercepts response:
      ├─ Log to request_logs:
      │  ├─ ipAddress
      │  ├─ endpoint: '/api/auth/signup'
      │  ├─ method: 'POST'
      │  ├─ userAgent
      │  ├─ email: the new user's email
      │  ├─ status: 'success'
      │  └─ timestamp
      └─ Send response to client

5. FRONTEND RECEIVES RESPONSE
   └─ authService returns result
   └─ If success:
      ├─ Store token in localStorage
      ├─ Set user state
      ├─ Update currentPage → 'dashboard'
      └─ Show UserDashboard
   └─ If error:
      └─ Display error message
      └─ Clear form
      └─ Stay on signup page
```

---

## Request Logging: What Happens Behind Scenes

```
EVERY Auth Endpoint Request
            │
            ▼
┌────────────────────────────────┐
│ originalJson = res.json        │
│ res.json = custom function     │
│ next()                         │
└────────────────────────────────┘
            │
     Route handler executes
            │
            ▼
┌────────────────────────────────┐
│ res.json(data) called          │
│ (response being sent)          │
└────────────────────────────────┘
            │
            ▼
┌────────────────────────────────┐
│ Custom res.json interceptor:   │
│ 1. Determine status            │
│    ├─ success: true = 'success'│
│    └─ success: false = 'failure│
│ 2. Create log entry:           │
│    ├─ ipAddress: req.ip        │
│    ├─ endpoint: req.path       │
│    ├─ method: req.method       │
│    ├─ userAgent: header        │
│    ├─ email: req.body.email    │
│    ├─ status: determined above │
│    ├─ reason: data.message     │
│    └─ timestamp: now()         │
│ 3. RequestLog.create(logEntry) │
│    └─ Async (non-blocking)     │
│ 4. Call originalJson(data)     │
│    └─ Send response            │
└────────────────────────────────┘
            │
            ▼
┌────────────────────────────────┐
│ MongoDB RequestLog Collection  │
│ (document added, TTL running)  │
│ (auto-delete after 30 days)    │
└────────────────────────────────┘
```

---

## Authentication Flow After Signup/Login

```
CLIENT:
┌─────────────────────────────┐
│ localStorage                │
│ authToken = "jwt_token"     │
└─────────────────────────────┘
         │
         │ (on every request)
         │
         ▼
┌─────────────────────────────────────┐
│ authService.js (axios interceptor) │
│                                     │
│ api.interceptors.request.use() {   │
│   const token =                    │
│     localStorage.getItem('auth..') │
│   if (token) {                      │
│     config.headers.Authorization   │
│       = `Bearer ${token}`           │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
         │
         │ Authorization: Bearer jwt_token
         │
         ▼
┌─────────────────────────────────────┐
│ Backend Middleware                  │
│ (for protected routes like /me)     │
│                                     │
│ authenticate middleware:            │
│ 1. Extract token from header       │
│ 2. jwt.verify(token, SECRET)       │
│ 3. If valid:                        │
│    └─ Set req.userId               │
│    └─ Set req.userEmail            │
│    └─ Call next()                  │
│ 4. If invalid:                      │
│    └─ Return 401 Unauthorized      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Controller (getCurrentUser)          │
│                                      │
│ 1. User.findById(req.userId)        │
│ 2. Return user information          │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend receives user data         │
│ Updates dashboard display           │
└─────────────────────────────────────┘
```

---

## CAPTCHA Challenge Flow

```
LOGIN ATTEMPT
    │
    ▼
┌──────────────────────────┐
│ Controller checks:       │
│ user.failedLoginAttempts│
└──────────────────────────┘
    │
    ├─ < 3 failures
    │  └─ Proceed normally
    │
    └─ ≥ 3 failures
       └─ Return: { requiresCaptcha: true }

CLIENT RECEIVES RESPONSE
    │
    ├─ requiresCaptcha: true
    │  └─ Frontend shows reCAPTCHA component
    │
    └─ User completes CAPTCHA
       └─ Google returns recaptchaToken
       └─ Frontend retries login with token

LOGIN RETRY WITH CAPTCHA TOKEN
    │
    ▼
┌──────────────────────────────────┐
│ Controller verifies:             │
│ - failedLoginAttempts ≥ 3        │
│ - recaptchaToken provided        │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│ axios.post(                          │
│   'recaptcha/api/siteverify',       │
│   { secret: RECAPTCHA_SECRET_KEY,   │
│     response: recaptchaToken }      │
│ )                                    │
└──────────────────────────────────────┘
    │
    ▼
GOOGLE reCAPTCHA API
(returns score: 0.0 - 1.0)
    │
    ├─ Score < 0.5 (bot-like)
    │  └─ Reject login attempt
    │
    └─ Score ≥ 0.5 (human-like)
       └─ Proceed with authentication

IF CREDENTIALS ALSO CORRECT
    │
    ▼
┌──────────────────────────────┐
│ Reset failedLoginAttempts    │
│ Set lastLoginTime            │
│ Generate token               │
│ Return success response      │
└──────────────────────────────┘
```

---

**Architecture reflects industry best practices:**
- ✅ Layered defense
- ✅ Separation of concerns
- ✅ Non-blocking operations
- ✅ Fail-safe defaults
- ✅ Clear data flow
- ✅ Extensible design
