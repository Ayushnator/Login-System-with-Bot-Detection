import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import { requestLogger } from './middleware/logging.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // HTTP request logging

// CORS - Allow frontend to communicate
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow localhost on any port (3000, 3001, 3002, etc.) and production URLs
  const isLocalhost = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));
  const isFrontendUrl = origin === process.env.FRONTEND_URL;
  
  if (isLocalhost || isFrontendUrl) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Request logging middleware
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
