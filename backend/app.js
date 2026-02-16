import express from 'express';
import 'dotenv/config';
import routes from './src/routes/index.route.js';
import { requestLogger } from './src/middleware/logger.middleware.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

console.log('[Server] Initializing Express server...');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// CORS middleware (allowing frontend to access backend)
app.use((req, res, next) => {
  console.log('[Server] CORS middleware applied');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Vite default port
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('[Server] OPTIONS request handled');
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/api', routes);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  console.log('[Server] Root endpoint accessed');
  res.json({
    success: true,
    message: 'Welcome to the API',
    endpoints: {
      health: '/api/health',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      currentUser: 'GET /api/auth/me'
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('[Server] 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`[Server] Server is running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});

export default app;
