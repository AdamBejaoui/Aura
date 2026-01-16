const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Extract user info from Google profile
            const email = profile.emails[0].value;
            const name = profile.displayName;
            const avatar = profile.photos[0]?.value;

            // Check if user already exists
            let user = await User.findOne({ email });

            if (!user) {
                // Create new user with Google data
                user = await User.create({
                    name,
                    email,
                    avatar,
                    isVerified: true, // Google emails are pre-verified
                    password: Math.random().toString(36).slice(-8) // Random password (won't be used)
                });
            } else if (!user.avatar && avatar) {
                // Update avatar if user exists but doesn't have one
                user.avatar = avatar;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            console.error('Google OAuth Error:', error);
            return done(error, null);
        }
    }
));

module.exports = passport;
