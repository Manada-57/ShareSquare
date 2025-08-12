import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Post from './models/post.js'
import User from './models/user.js';
import passport from 'passport';
import './auth/passport-config.js';
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const app = express();
app.use(express.json());
app.use(session({
  secret: 'sharesquare_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if using HTTPS
}));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://localhost:27017/sharesquare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ Connection error:', err);
});
app.post('/api/signup', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser = new User({
    name,
    email,
    password,
    mobileNumber: '',
    gender: '',
    country: '',
    state: '',  
    city: ''
  });

  try {
    await newUser.save();
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }
    const userInfo = { email: user.email }; 
    return res.status(200).json({ status: 'ok', message: 'Login successful',user: userInfo });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


// Check current session
app.get('/api/current-user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});
app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Name may differ if changed
    res.json({ message: 'Logged out successfully' });
  });
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:5173/home',
  failureRedirect: 'http://localhost:5173/login',
}));
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: 'http://localhost:5173/home',
  failureRedirect: 'http://localhost:5173/login'
}));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: 'http://localhost:5173/home',
  failureRedirect: 'http://localhost:5173/login'
}));  
app.post("/api/post", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, condition, location, userEmail } = req.body;
    const tags = JSON.parse(req.body.tags || "[]");
    const contactPrefs = JSON.parse(req.body.contactPrefs || "[]");

    const newItem = new Post({
      title,
      description,
      category,
      condition,
      tags,
      location,
      contactPrefs,
      userEmail,
      images: req.files.map(file => file.filename)
    });

    await newItem.save();
    res.json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/posts", async (req, res) => {
  const { email } = req.query;
  try {
    const posts = await Post.find({ userEmail : email });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
