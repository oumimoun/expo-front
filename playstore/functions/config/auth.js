const passport = require('passport');
const FortyTwoStrategy = require('passport-42').Strategy;
const { isAdmin } = require('./admin');

// Initialize passport with 42 strategy
const initialize42Auth = (admin) => {
  const db = admin.firestore();
  const usersCollection = db.collection('users');

  passport.use(new FortyTwoStrategy({
    clientID: process.env.FORTYTWO_CLIENT_ID,
    clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
    callbackURL: process.env.FORTYTWO_CALLBACK_URL || 'http://localhost:3000/api/auth/42/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in Firestore
      const userDoc = await usersCollection.doc(profile.id.toString()).get();
      
      // Check if user is an admin
      const isUserAdmin = await isAdmin(profile.username);
      const userRole = isUserAdmin ? 'admin' : 'user';

      if (!userDoc.exists) {
        // Create new user if doesn't exist
        const userData = {
          fortytwoId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          username: profile.username,
          avatar: profile._json.image.link,
          role: userRole,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          accessToken,
          refreshToken
        };

        await usersCollection.doc(profile.id.toString()).set(userData);
        return done(null, { id: profile.id, ...userData });
      }

      // Update existing user's last login, tokens, and role
      await usersCollection.doc(profile.id.toString()).update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        accessToken,
        refreshToken,
        role: userRole // Update role in case admin status has changed
      });

      const updatedUserData = {
        ...userDoc.data(),
        role: userRole,
        accessToken,
        refreshToken
      };

      return done(null, { id: profile.id, ...updatedUserData });
    } catch (error) {
      return done(error, null);
    }
  }));

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const userDoc = await usersCollection.doc(id.toString()).get();
      if (!userDoc.exists) {
        return done(new Error('User not found'), null);
      }
      done(null, { id, ...userDoc.data() });
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = {
  initialize42Auth
}; 