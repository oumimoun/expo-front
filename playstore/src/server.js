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

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());


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
          { path: '/user', method: 'GET', description: 'Get current user info' }
        ]
      },
      events: {
        base: '/api/events',
        routes: [
          { path: '/', method: 'GET', description: 'Get all events' },
          { path: '/:id', method: 'GET', description: 'Get event by ID' },
          { path: '/', method: 'POST', description: 'Create new event (Staff only)' },
          { path: '/:id', method: 'PUT', description: 'Update event (Staff only)' },
          { path: '/:id', method: 'DELETE', description: 'Delete event (Staff only)' }
        ]
      },
      users: {
        base: '/api/users',
        routes: [
          { path: '/', method: 'GET', description: 'Get all users' },
          { path: '/:id', method: 'GET', description: 'Get user by ID' }
        ]
      }
    }
  });
});


app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 