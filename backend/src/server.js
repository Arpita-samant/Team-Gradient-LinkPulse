import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { handleRedirect } from './controllers/redirectController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (essential for Vercel, Render, Railway, AWS, and secure HTTPS redirects)
app.set('trust proxy', 1);

// Configure CORS for production and development
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [process.env.CLIENT_URL || 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    // Permissive callback for flexible preview deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LinkPulse API Server'
  });
});

// Explicit redirection route with /r/ prefix (in case needed)
app.get('/r/:shortCode', handleRedirect);

// Main redirection route for root short links (e.g., /abc123)
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
  console.log(`[LinkPulse] Server running on http://localhost:${PORT}`);
  console.log(`[LinkPulse] Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[LinkPulse] Short URL base: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`===============================================`);
});

export default app;
