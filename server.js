import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Post from './models/post.js';
import User from './models/user.js';
import passport from 'passport';
import './auth/passport-config.js';
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from "nodemailer";
import crypto from "crypto";
import moment from "moment";
import Verification from './models/verification.js';
import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // <-- your Stripe secret key from .env

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(session({
  secret: 'sharesquare_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Success message
cloudinary.v2.api.ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch(err => console.error("❌ Cloudinary connection failed:", err));

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'sharesquare',               // folder name in your Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // restrict formats
  },
});

const upload = multer({ storage });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// ---------------- CONNECT TO MONGO ----------------
const mongoURI = 'mongodb+srv://jseetharaman07bcs27:cooDGXdEE4Z6mJet@sharesquare.tkw31yh.mongodb.net/ShareSquare';
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error(err));

// ---------------- SOCKET.IO CHAT ----------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("chat-message", (data) => io.emit("chat-message", data));

  socket.on("disconnect", () => console.log("🔴 User disconnected:", socket.id));
});

// ---------------- AUTH ROUTES ----------------
app.post('/api/signup', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  if (!name || !email || !password || !confirmpassword) return res.status(400).json({ message: 'Please fill all fields' });
  if (password !== confirmpassword) return res.status(400).json({ message: 'Passwords do not match' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email already exists' });

  const newUser = new User({ name, email, password, mobileNumber:'', gender:'', country:'', state:'', city:'' });
  try {
    await newUser.save();
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ status:'error', message:'Invalid credentials' });
    res.status(200).json({ status:'ok', message:'Login successful', user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ status:'error', message: err.message });
  }
});


app.get('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);

app.post('/api/verify/sendc', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const code = crypto.randomInt(100000, 999999); // 6-digit code
  const expiry = moment().add(10, 'minutes').toDate();

  await Verification.findOneAndUpdate(
    { email },
    { code, expiresAt: expiry, verified: false },
    { upsert: true }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to send email.' });
    res.status(200).json({ message: 'Verification code sent.' });
  });
});
app.post('/api/verify/check', async (req, res) => {
  const { email, code } = req.body;
  const record = await Verification.findOne({ email });
  if (!record) return res.status(400).json({ message: 'No verification code found.' });

  if (new Date() > record.expiresAt) {
    await Verification.deleteOne({ email });
    return res.status(400).json({ message: 'Code expired.' });
  }

  if (parseInt(code) !== record.code) {
    return res.status(400).json({ message: 'Invalid code.' });
  }

  record.verified = true;
  await record.save();

  res.status(200).json({ message: 'Email verified successfully!' });
});

// ---------------- POSTS ROUTES ----------------
app.post('/api/post', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success:false, error:'No files uploaded' });

    const { title, description, category, condition, location, userEmail } = req.body;
    const tags = JSON.parse(req.body.tags || '[]');
    const contactPrefs = JSON.parse(req.body.contactPrefs || '[]');

    // Store Cloudinary URLs
    const imageUrls = req.files.map(file => file.path);

    const newItem = new Post({
      title,
      description,
      category,
      condition,
      tags,
      location,
      contactPrefs,
      userEmail,
      images: imageUrls
    });

    await newItem.save();
    res.json({ success:true, item: newItem });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});
app.post("/api/users/editprofile/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});
app.get('/api/posts', async (req, res) => {
  const { email } = req.query;
  try {
    const posts = await Post.find({ userEmail: email });
    res.json(posts); // images already contain Cloudinary URLs
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EXPLORE POSTS ----------------
app.get('/api/explore', async (req, res) => {
  try {
    const posts = await Post.aggregate([{ $sample: { size: 20 } }]);
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      email: post.userEmail,
      images: post.images
    }));
    res.json(formattedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch explore posts' });
  }
});
app.get("/api/user", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id:user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      followers: user.followersList.length,
      following: user.followingList.length,
      followersList: user.followersList, // needed to check connection status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/make-payment", async (req, res) => {
  try {
    const { amount, productName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: productName },
          unit_amount: amount * 100, // rupees -> paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success?product=${encodeURIComponent(productName)}`,
      cancel_url: 'http://localhost:5173/payment-cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  }
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});