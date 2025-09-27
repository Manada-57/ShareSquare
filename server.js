import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Post from './models/post.js';
import User from './models/user.js';
import Message from './models/message.js';
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
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for now
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(session({
  secret: 'sharesquare_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.v2.api.ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch(err => console.error("❌ Cloudinary connection failed:", err));
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'sharesquare',               
    allowed_formats: ['jpg', 'jpeg', 'png'],
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
const mongoURI =process.env.MONGODB_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error(err));
io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("joinRoom", ({ user1, user2 }) => {
    const room = [user1, user2].sort().join("_");
    socket.join(room);
  });
  socket.on("chatMessage", async (msgObj) => {
    try {
      const msg = new Message(msgObj);
      await msg.save();
      const room = [msgObj.sender, msgObj.receiver].sort().join("_");
      io.to(room).emit("chatMessage", msg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
  socket.on("disconnect", () => console.log("User disconnected"));
});
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
})
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
  passport.authenticate('google', { failureRedirect: 'https://sharesquare-y50q.onrender.com/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`https://sharesquare-y50q.onrender.com/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('https://sharesquare-y50q.onrender.com/login');
    }
  }
);
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: 'https://sharesquare-y50q.onrender.com/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`https://sharesquare-y50q.onrender.com?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('https://sharesquare-y50q.onrender.com/login');
    }
  }
);
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'https://sharesquare-y50q.onrender.com/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`https://sharesquare-y50q.onrender.com/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('https://sharesquare-y50q.onrender.com/login');
    }
  }
);
app.get('/api/current-user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});
app.post('/api/verify/sendc', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const code = crypto.randomInt(100000, 999999);
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
app.post('/api/post', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success:false, error:'No files uploaded' });

    const { title, description, category, condition, location, userEmail } = req.body;
    const tags = JSON.parse(req.body.tags || '[]');
    const contactPrefs = JSON.parse(req.body.contactPrefs || '[]');
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
app.get('/api/posts', async (req, res) => {
  const { email } = req.query;
  try {
    const posts = await Post.find({ userEmail: email });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/posts/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const regex = new RegExp(query, "i");
    const posts = await Post.find({
      $or: [{ title: regex }, { description: regex }]
    }).limit(50);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/users/editprofile/:email", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});
app.get('/api/explore', async (req, res) => {
  try {
    const posts = await Post.aggregate([{ $sample: { size: 20 } }]);
    const userEmails = posts.map(p => p.userEmail);
    const users = await User.find({ email: { $in: userEmails } }).select("email name");
    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.username;
    });
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      email: post.userEmail,
      username: userMap[post.userEmail] || post.userEmail.split("@")[0], // fallback
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
  username: user.username,
  name: user.name,
  email: user.email,
  bio: user.bio,
  mobilenumber:user.mobileNumber,
  profilePic: user.profilePic,
  followers: user.followersList ? user.followersList.length : 0,
  following: user.followingList ? user.followingList.length : 0,
  followersList: user.followersList || [],
  followingList: user.followingList || [],
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/messages", async (req, res) => {
  const { user1, user2 } = req.query;
  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort({ timestamp: 1 });
  res.json(messages);
});
app.get("/api/chats/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;
    const messages = await Message.find({
      $or: [{ sender: userEmail }, { receiver: userEmail }],
    }).sort({ timestamp: -1 });

    const chatsMap = {};

    for (const msg of messages) {
      const otherUser = msg.sender === userEmail ? msg.receiver : msg.sender;

      if (!chatsMap[otherUser]) {
        // ✅ Fetch username from User collection
        const user = await User.findOne({ email: otherUser }).select("name");

        chatsMap[otherUser] = {
          email: otherUser,
          name: user ? user.name : otherUser.split("@")[0], // fallback if no user found
          lastMessage: msg.text,
          lastTime: msg.timestamp,
        };
      }
    }

    const chats = Object.values(chatsMap);
    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});


