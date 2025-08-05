import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import axios from 'axios';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// GOOGLE STRATEGY
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: profile.displayName,
        email,
        password: '',
        mobileNumber: '',
        gender: '',
        country: '',
        state: '',
        city: ''
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// GITHUB STRATEGY
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/github/callback',
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: profile.displayName || profile.username,
        email,
        password: '',
        mobileNumber: '',
        gender: '',
        country: '',
        state: '',
        city: ''
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// LINKEDIN (OpenID Connect)
passport.use('linkedin', new OpenIDConnectStrategy({
  issuer: 'https://www.linkedin.com/oauth',
  authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/linkedin/callback',
  scope: ['openid', 'profile', 'email']
}, async (issuer, sub, profile, jwtClaims, accessToken, refreshToken, done) => {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const data = response.data;
    const email = data.email;
    const firstName = data.given_name;
    const lastName = data.family_name;

    if (!email) {
      return done(new Error('Email not found in userinfo response'), null);
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: `${firstName} ${lastName}`,
        email,
        password: '',
        mobileNumber: '',
        gender: '',
        country: '',
        state: '',
        city: ''
      });
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
}));

export default passport;
