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
import { GridFSBucket } from 'mongodb';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app); // ✅ Use http server for socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your React frontend URL
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

const mongoURI = 'mongodb://localhost:27017/sharesquare';

let gfsBucket;
let upload;

// ---------------- CONNECT TO MONGO ----------------
const startServer = async () => {
  await mongoose.connect(mongoURI);
  console.log('✅ Connected to MongoDB');

  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  console.log('✅ GridFSBucket ready');

  // Disk storage for multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './tmp_uploads';
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  upload = multer({ storage });
  console.log('✅ Multer disk storage ready');

  server.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
};

startServer().catch(err => console.error(err));


// ---------------- SOCKET.IO CHAT ----------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Listen for chat messages
  socket.on("chat-message", (data) => {
    console.log("💬 Message:", data);

    // Broadcast to all connected clients
    io.emit("chat-message", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
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
// Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);

// LinkedIn
app.get('/auth/linkedin',
  passport.authenticate('linkedin')
);

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);

// GitHub
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    if (req.user && req.user.email) {
      res.redirect(`http://localhost:5173/login?email=${encodeURIComponent(req.user.email)}`);
    } else {
      res.redirect('http://localhost:5173/login');
    }
  }
);

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
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});


// ---------------- POSTS ROUTES ----------------
app.post('/api/post', (req, res) => {
  if (!upload) return res.status(503).json({ success:false, error:'Upload system not ready.' });

  upload.array('images', 5)(req, res, async (err) => {
    if (err) return res.status(500).json({ success:false, error: err.message });

    try {
      if (!req.files || req.files.length === 0) return res.status(400).json({ success:false, error:'No files uploaded' });

      const { title, description, category, condition, location, userEmail } = req.body;
      const tags = JSON.parse(req.body.tags || '[]');
      const contactPrefs = JSON.parse(req.body.contactPrefs || '[]');

      const imageFilenames = [];

      for (const file of req.files) {
        const filePath = path.join(file.destination, file.filename);
        const readStream = fs.createReadStream(filePath);

        // Set contentType for browser
        const uploadStream = gfsBucket.openUploadStream(file.filename, {
          contentType: file.mimetype
        });

        readStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });

        fs.unlinkSync(filePath); // delete temp file
        imageFilenames.push(file.filename);
      }

      const newItem = new Post({
        title, description, category, condition,
        tags, location, contactPrefs, userEmail,
        images: imageFilenames
      });

      await newItem.save();
      res.json({ success:true, item: newItem });
    } catch (err) {
      res.status(500).json({ success:false, error: err.message });
    }
  });
});app.get('/api/posts', async (req, res) => {
   const { email } = req.query; 
   try { 
    const posts = await Post.find({ userEmail: email }); 
    const formattedPosts = posts.map(post => ({ ...post._doc, images: post.images // return the array of filenames as-is 
})); 
res.json(formattedPosts);
 } catch (err) {
   res.status(500).json({ error: err.message }); 
  } 
});
// ---------------- IMAGE FETCH ROUTE ----------------
app.get('/api/image/:filename', async (req, res) => {
  try {
    const file = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file.contentType || 'image/jpeg');
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- EXPLORE POSTS (random) ----------------
app.get('/api/explore', async (req, res) => {
  try {
    const posts = await Post.aggregate([{ $sample: { size: 20 } }]);

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      email: post.userEmail, // directly included from Post schema
      images: post.images     }));

    res.json(formattedPosts);
  } catch (err) {
    console.error("Error fetching explore posts:", err);
    res.status(500).json({ error: "Failed to fetch explore posts" });
  }
});



