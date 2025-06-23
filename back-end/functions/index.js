const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { getFirebaseAdmin } = require('./config/firebase');
require('dotenv').config();

// Get Firebase Admin instance
const admin = getFirebaseAdmin();

// Import route handlers and middleware
const { router: authRoutes, initializeAuthRoutes } = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { initializeAuth } = require('./middleware/auth');

// Create Express app
const app = express();

// Initialize auth middleware
initializeAuth();
initializeAuthRoutes(admin);

// CORS configuration with allowed origins
const allowedOrigins = [
  'exp://*.exp.direct',
  'https://europe-west1-playstore-e4a65.cloudfunctions.net/api'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return origin === pattern;
    });
    
    if (!isAllowed) {
      console.log('Blocked origin:', origin);
      return callback(null, false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cookie middleware
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Override res.cookie to set proper options
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: true, // Always use secure in Firebase Functions
      sameSite: 'None', // Required for cross-site cookies
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    
    // Set domain based on the environment
    if (isProduction) {
      defaultOptions.domain = 'europe-west1-playstore-e4a65.cloudfunctions.net';
    }
    
    return originalCookie(name, value, { ...defaultOptions, ...options });
  };
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root route - API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Event Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          { path: '/42', method: 'GET', description: '42 OAuth login' },
          { path: '/42/callback', method: 'GET', description: '42 OAuth callback' },
          { path: '/logout', method: 'GET', description: 'Logout current user' }
        ]
      },
      events: {
        base: '/api/events',
        routes: [
          { path: '/', method: 'GET', description: 'Get all events (requires authentication)' },
          { path: '/past', method: 'GET', description: 'Get past events (requires authentication)' },
          { path: '/:id', method: 'GET', description: 'Get event by ID (requires authentication)' },
          { path: '/', method: 'POST', description: 'Create new event (Admin only)' },
          { path: '/:id', method: 'PUT', description: 'Update event (Admin only)' },
          { path: '/:id', method: 'DELETE', description: 'Delete event (Admin only)' },
          { path: '/:id/register', method: 'POST', description: 'Register or unregister for an event (requires authentication)' }
        ]
      },
      users: {
        base: '/api/users',
        routes: [
          { path: '/', method: 'GET', description: 'Get current user info (requires authentication)' },
          { path: '/notifications', method: 'GET', description: 'Get user notifications (requires authentication)' }
        ]
      }
    }
  });
});

// Export the Express app as a Firebase Function
exports.api = functions
  .region('europe-west1')  // Choose a region close to your users
  .runWith({
    memory: '256MB',
    timeoutSeconds: 60
  })
  .https.onRequest(app); 