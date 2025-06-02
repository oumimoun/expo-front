const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { initializeFirebase, getFirebaseAdmin } = require('./config/firebase');
const { initialize42Auth } = require('./config/auth');
const { initializeAuth, createDefaultAdmin } = require('./middleware/auth');

// Initialize Firebase first
initializeFirebase();

// Initialize auth middleware
initializeAuth();

// Only initialize 42 authentication if credentials are present
if (process.env.FORTYTWO_CLIENT_ID && process.env.FORTYTWO_CLIENT_SECRET) {
  initialize42Auth(getFirebaseAdmin());
} else {
  console.log('Warning: 42 OAuth credentials not found in environment variables. 42 authentication is disabled.');
}

// Create default admin user
createDefaultAdmin();

const eventRoutes = require('./routes/events');
const { router: authRoutes, initializeAuthRoutes } = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Initialize auth routes
initializeAuthRoutes(getFirebaseAdmin());

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
      },
      admin: {
        base: '/api/admin',
        routes: [
          { path: '/addClubManager', method: 'POST', description: 'Add a new club manager (Admin only)' },
          { path: '/removeClubManager', method: 'POST', description: 'Remove a club manager (Admin only)' },
          { path: '/getClubInfo', method: 'POST', description: 'Get club information (Admin only)' }
        ]
      }
    }
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 