# Secure Login System - Backend

Simple, focused backend implementation with comprehensive bot detection.

## Features

- **User Authentication** with JWT tokens
- **Rate Limiting** (5 requests per IP per 10 minutes)
- **Honeypot Protection** for bot detection
- **CAPTCHA Integration** (Google reCAPTCHA v3)
- **Request Logging** to MongoDB
- **Password Hashing** with bcryptjs
- **Behavioral Tracking** (optional, sent from frontend)

## API Endpoints

All endpoints are prefixed with `/api/auth`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Authenticate user | No |
| GET | `/me` | Get current user | Yes |

See [../README.md](../README.md) for detailed endpoint documentation and examples.

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/login-system
JWT_SECRET=your_jwt_secret_key_here_keep_it_secure
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Installation & Running

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB (if running locally)
mongod

# Run development server
npm run dev

# Server will be available at http://localhost:5000
```

## Bot Detection Mechanisms

1. **Rate Limiting**: Max 5 requests per IP per 10 minutes
2. **Honeypot Field**: Hidden form field detection
3. **CAPTCHA**: Triggered after 3 failed login attempts
4. **Request Logging**: All attempts logged with IP, User-Agent, timestamp
5. **Failed Attempt Tracking**: Per-user counter for adaptive security

## Project Structure

```
src/
├── config/
│   ├── database.js       # MongoDB connection
│   └── constants.js      # Configuration values
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── authentication.js # JWT verification
│   ├── honeypot.js       # Hidden field detection
│   ├── logging.js        # Request logging
│   └── rateLimiter.js    # Rate limiting setup
├── models/
│   ├── User.js          # User schema
│   └── RequestLog.js    # Activity logging schema
├── routes/
│   └── authRoutes.js    # API route definitions
└── server.js            # Express app setup
```

## Security Notes

- Passwords are **never stored in plain text** (bcryptjs hashing)
- **JWT tokens expire** after 7 days
- **Rate limiting** prevents brute-force attacks
- **Honeypot protection** silently blocks bots
- **Request logs** enable pattern detection and compliance auditing

## Development Tips

- Use MongoDB Compass to inspect data
- Check browser console on frontend for behavioral signals
- Review request_logs for attack patterns
- Adjust constants.js for different thresholds

## Production Considerations

- Use strong, random `JWT_SECRET`
- Switch rate limiter to Redis store for distributed systems
- Enable HTTPS
- Set up external logging (Sentry, Datadog, etc.)
- Implement refresh token strategy
- Add request validation and sanitization

---

See [../README.md](../README.md) for complete project documentation.
