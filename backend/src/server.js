import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { handleRedirect } from './controllers/redirectController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General rate limiter on API
app.use('/api', generalLimiter);

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LinkPulse API Server'
  });
});

// Explicit redirection route with /r/ prefix (in case needed)
app.get('/r/:shortCode', handleRedirect);

// Main redirection route for root short links (e.g., http://localhost:5000/abc123)
app.get('/:shortCode', (req, res, next) => {
  // Ignore favicon and system paths
  if (req.params.shortCode === 'favicon.ico' || req.params.shortCode.startsWith('api')) {
    return next();
  }
  handleRedirect(req, res);
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 LinkPulse Server running on http://localhost:${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Short URL base: http://localhost:${PORT}`);
  console.log(`===============================================`);
});

export default app;
