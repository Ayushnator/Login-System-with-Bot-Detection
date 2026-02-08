# Quick Start Guide

## 🚀 Get the Project Running in 5 Minutes

### Prerequisites Check
- [ ] Node.js installed (`node --version`)
- [ ] MongoDB running (`mongod` in terminal or service)
- [ ] Git (optional)

### Step 1: Clone/Extract the Project
```bash
cd loginsystem
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings:
# - MONGODB_URI: your MongoDB connection string
# - JWT_SECRET: generate a random string
# - RECAPTCHA_SECRET_KEY: from Google reCAPTCHA admin console (optional for testing)
```

### Step 3: Verify MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: Check MongoDB is running
# Use MongoDB Compass to connect to mongodb://localhost:27017
```

### Step 4: Start Backend
```bash
# From backend directory
npm run dev

# Expected output:
# Server running on port 5000
# MongoDB Connected: localhost
```

### Step 5: Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with:
# - REACT_APP_API_URL=http://localhost:5000/api
# - REACT_APP_RECAPTCHA_SITE_KEY: optional (use any value for testing)
```

### Step 6: Start Frontend
```bash
# From frontend directory
npm start

# Browser opens to http://localhost:3000
```

## ✅ Testing the System

### Test Signup
1. Go to http://localhost:3000
2. Click "Create an account"
3. Fill in email, username, password
4. Submit (button disabled for 2 seconds initially)
5. Check console for typing delay
6. Success redirects to dashboard

### Test Login
1. Go to login page
2. Enter same credentials
3. See dashboard
4. Review "Security Features in Action" section

### Test Bot Detection
1. Try to login with wrong password 3+ times
2. On 4th attempt, CAPTCHA appears
3. Try to fill honeypot field:
   - Open DevTools
   - Set `document.querySelector('[name="website"]').value = "spam"`
   - Submit form
   - Server rejects request with "Invalid request"

### Test Rate Limiting
```bash
# From terminal, try 6 rapid login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# 6th request returns 429 Too Many Requests
```

## 📊 Monitor the System

### MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Browse `login-system` database
3. View collections:
   - `users`: Registered accounts
   - `request_logs`: Authentication attempts

### Browser Console
1. Open DevTools (F12)
2. Click login/signup form inputs
3. See "Typing delay: Xms" logged

### Check Server Health
```bash
curl http://localhost:5000/health

# Expected response:
# {"status":"Server is running"}
```

## 🔧 Common Issues

### "Cannot find module" error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running
# Local: mongod in terminal
# Cloud: Check connection string in .env
# Or check service: net start MongoDB (Windows)
```

### Port Already in Use
```bash
# Change port in .env (backend)
PORT=5001

# Or find process using port
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000
```

### CORS Errors
- Check `FRONTEND_URL` in backend .env
- Should be `http://localhost:3000` for development
- Frontend `REACT_APP_API_URL` should be `http://localhost:5000/api`

## 📚 Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **Explore Backend Code**: Check comments in [backend/src](backend/src)
3. **Review Frontend Components**: See [frontend/src](frontend/src)
4. **Study Security Features**: Read about each bot detection technique in README.md
5. **Customize**: Adjust thresholds in [backend/src/config/constants.js](backend/src/config/constants.js)

## 🏆 Interview Prep

Practice explaining:
1. **Rate Limiting**: How it prevents brute-force attacks
2. **Honeypot**: Why it silently rejects bots
3. **CAPTCHA Placement**: Why only after suspicious activity
4. **Behavioral Signals**: How typing delays indicate bots
5. **Request Logging**: What you'd analyze post-incident

See "Interview Talking Points" in [README.md](README.md) for more.

## 🐛 Debug Mode

### Enable Verbose Logging
Edit `backend/src/server.js`:
```javascript
// Change this line
app.use(morgan('combined')); // Currently logs every request

// For more detail in development
app.use(morgan('dev'));
```

### Monitor MongoDB Queries
```javascript
// In MongoDB Compass or CLI
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **React**: https://react.dev
- **JWT**: https://jwt.io
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **reCAPTCHA**: https://www.google.com/recaptcha/admin

---

**Ready to start?** Begin with Step 1 above!
