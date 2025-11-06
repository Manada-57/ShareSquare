import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Post from './models/post.js';
import User from './models/user.js';
import Report from './models/report.js';
import Message from './models/message.js';
import Request from './models/request.js';
import Subscription from './models/subscription.js'; 
import passport from 'passport';
import Stripe from 'stripe';
import './auth/passport-config.js';
import dotenv from 'dotenv';
import axios from 'axios';
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
  socket.on("joinUserRoom", ({ email }) => {
    socket.join(email); // each user joins a room named after their email
    console.log(`${email} joined their personal room`);
  });
  socket.on("chatMessage", async (msgObj) => {
    try {
      const msg = new Message(msgObj);
      await msg.save();
      const room = [msgObj.sender, msgObj.receiver].sort().join("_");
      io.to(room).emit("chatMessage", msg);
      io.to(msgObj.receiver).emit("chatMessage", msg);
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
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASS = "admin123";
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      return res.status(200).json({
        status: 'ok',
        message: 'Admin login successful',
        redirect: '/admin-dashboard'
      });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    res.status(200).json({
      status: 'ok',
      message: 'Login successful',
      redirect: '/home',
      user: { email: user.email }
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
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
// Send OTP using Brevo
app.post('/api/verify/sendc', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999);
  const expiry = moment().add(10, 'minutes').toDate();
  // Save/update in DB
  await Verification.findOneAndUpdate(
    { email },
    { code, expiresAt: expiry, verified: false },
    { upsert: true }
  );
  // Brevo email payload
  const mailData = {
    sender: { name: "My Student Project", email: process.env.BREVO_FROM_EMAIL },
    to: [{ email }],
    subject: "Your Verification Code",
    htmlContent: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    textContent: `Your verification code is ${code}. It expires in 10 minutes.`
  };
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      mailData,
      {
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    res.status(200).json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Brevo send error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});
// Verify OTP
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
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, error: 'No files uploaded' });

    const {
      title,
      description,
      category,
      condition,
      location,
      latitude,
      longitude,
      userEmail
    } = req.body;

    const tags = JSON.parse(req.body.tags || '[]');
    const contactPrefs = JSON.parse(req.body.contactPrefs || '[]');
    const imageUrls = req.files.map(file => file.path);

    // ✅ Create new post document
    const newItem = new Post({
      title,
      description,
      category,
      condition,
      tags,
      location,
      latitude,
      longitude,
      contactPrefs,
      userEmail,
      images: imageUrls,
    });

    await newItem.save();

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ success: false, error: err.message });
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
app.delete("/api/posts/delete-multiple", async (req, res) => {
  try {
    const { ids } = req.body;
    await Post.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Posts deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting posts" });
  }
});
app.get('/api/explore', async (req, res) => {
  try {
    const { city } = req.query;
    let posts;

    if (city) {
      posts = await Post.find({
        city: { $regex: new RegExp(city, "i") }
      }).limit(20);
    } else {
      posts = await Post.aggregate([{ $sample: { size: 20 } }]);
    }

    // Collect user emails
    const userEmails = posts.map(p => p.userEmail);
    const users = await User.find({ email: { $in: userEmails } }).select("email username");

    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = u.username;
    });

    // Format posts including category
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      email: post.userEmail,
      username: userMap[post.userEmail] || post.userEmail.split("@")[0],
      images: post.images,
      city: post.city || "Unknown",
      category: post.category || "Other" // <-- include category
    }));

    res.json(formattedPosts);
  } catch (err) {
    console.error("❌ Failed to fetch explore posts:", err);
    res.status(500).json({ error: "Failed to fetch explore posts" });
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
      mobilenumber: user.mobileNumber,
      mobileNumber: user.mobileNumber, // Add both for compatibility
      gender: user.gender,              // ✅ ADD THIS
      country: user.country,            // ✅ ADD THIS
      state: user.state,                // ✅ ADD THIS
      city: user.city,                  // ✅ ADD THIS
      profilePic: user.profilePic,
      followers: user.followersList ? user.followersList.length : 0,
      following: user.followingList ? user.followingList.length : 0,
      followersList: user.followersList || [],
      followingList: user.followingList || [],
      trustScore: user.trustScore,
      ratingsReceived: user.ratingsReceived
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
app.post("/api/report", async (req, res) => {
  try {
    const { reporterEmail, reportedEmail, reason, otherReason } = req.body;

    if (!reporterEmail || !reportedEmail || !reason) {
      return res.status(400).json({ message: "Reporter, reported, and reason are required" });
    }

    const validReasons = ["Spam", "Inappropriate Content", "Harassment", "Fake Post", "Others"];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: "Invalid reason selected" });
    }

    if (reason === "Others" && (!otherReason || !otherReason.trim())) {
      return res.status(400).json({ message: "Please provide a reason for 'Others'" });
    }

    // ✅ Save report
    const newReport = new Report({
      reporterEmail,
      reportedEmail,
      reason,
      otherReason: reason === "Others" ? otherReason : "",
    });
    await newReport.save();

    // ✅ Update reported user's report count
    const reportedUser = await User.findOne({ email: reportedEmail });
    if (reportedUser) {
      reportedUser.reports = (reportedUser.reports || 0) + 1;

      // 🔻 Reduce trust score if reports > 5
      if (reportedUser.reports > 5) {
        reportedUser.trustScore = Math.max(0, reportedUser.trustScore - 10);
      }

      await reportedUser.save();
    }

    res.status(201).json({
      message: "Report submitted successfully",
      totalReports: reportedUser?.reports,
      trustScore: reportedUser?.trustScore,
    });
  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user by email
app.delete("/api/admin/users/:email", async (req, res) => {
  try {
    await User.deleteOne({ email: req.params.email });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reports
app.get("/api/admin/reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete report by ID
app.delete("/api/admin/reports/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/api/admin/user-messages/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const messages = await Message.find({
      $or: [{ sender: email }, { receiver: email }]
    }).sort({ timestamp: 1 }); // sort by time ascending

    // Add senderName and receiverName
    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      const sender = await User.findOne({ email: msg.sender });
      const receiver = await User.findOne({ email: msg.receiver });

      return {
        _id: msg._id,
        sender: msg.sender,
        senderName: sender?.name || msg.sender,
        receiver: msg.receiver,
        receiverName: receiver?.name || msg.receiver,
        text: msg.text,
        timestamp: msg.timestamp
      };
    }));

    res.json(populatedMessages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
app.post("/api/request", async (req, res) => {
  try {
    const { postId, postTitle, requestType, requestedBy, acceptedBy } = req.body;

    if (!postId || !postTitle || !requestType || !requestedBy || !acceptedBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Avoid duplicate pending requests
    const existing = await Request.findOne({
      postId,
      requestedBy,
      acceptedBy,
      status: "Pending"
    });
    if (existing) {
      return res.status(400).json({ message: "Request already sent and pending." });
    }

    const newRequest = new Request({
      postId,
      postTitle,
      requestType,
      requestedBy,
      acceptedBy
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent successfully", request: newRequest });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ 2. Fetch all requests for a user (to show incoming/outgoing)
app.get("/api/requests/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // All requests where user is involved (either as sender or receiver)
    const requests = await Request.find({
      $or: [{ requestedBy: email }, { acceptedBy: email }]
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});
app.post("/api/request/send", async (req, res) => {
  try {
    const { postId, postTitle, requestType, requesterEmail, ownerEmail, startDate, endDate } = req.body;
    if (!postId || !postTitle || !requestType || !requesterEmail || !ownerEmail || !startDate) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    if (requestType === "Borrow" && !endDate) {
      return res.status(400).json({ message: "End date is required for Borrow requests" });
    }
    const existing = await Request.findOne({
      postId,
      requesterEmail,
      ownerEmail,
      status: "Pending"
    });
    if (existing) {
      return res.status(400).json({ message: "Request already sent and pending." });
    }
    const newRequest = new Request({
      postId,
      postTitle,
      requestType,
      requesterEmail,
      ownerEmail,
      startDate: new Date(startDate),
      endDate: requestType === "Borrow" ? new Date(endDate) : null
    });
    await newRequest.save();
    res.status(201).json({ message: "Request sent successfully", request: newRequest });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ 3. Accept or Decline a request
app.put("/api/request/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "Accept" or "Decline"

    if (!["Accept", "Decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status: action === "Accept" ? "Accepted" : "Declined" },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: `Request ${action.toLowerCase()}ed successfully`, request: updatedRequest });
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/api/make-payment", async (req, res) => {
  try {
    const { amount, productName, userEmail, planType, days } = req.body;
    if (!userEmail  || !planType || !days) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await Subscription.findOne({ userEmail });
    if (existing && existing.expiryDate > new Date()) {
      return res.status(400).json({ error: "You already have an active subscription" });
    }
    const subscribedAt = new Date();
    const expiryDate = new Date(subscribedAt.getTime() + days * 24 * 60 * 60 * 1000);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: productName },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
       success_url: `http://localhost:5000/payment-success?product=${encodeURIComponent(productName)}`,
      cancel_url: 'http://localhost:5000/payment-cancel',

    });

    // Save subscription with pending paymentId
    await Subscription.findOneAndUpdate(
      { userEmail },
      { userEmail, planType, days, subscribedAt, expiryDate, paymentId: session.id },
      { upsert: true, new: true }
    );

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  }
});
app.get("/api/request/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const requests = await Request.find({
      $or: [{ requesterEmail: email }, { ownerEmail: email }],
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching requests" });
  }
});
app.put("/api/request/action/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const newStatus = action === "Accept" ? "Accepted" : "Rejected";
    const updated = await Request.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/api/subscription/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(" Fetching subscription for:", email);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const subscription = await Subscription.findOne({ userEmail: email });
    
    if (!subscription) {
      console.log("❌ No subscription found for:", email);
      return res.status(200).json({ subscription: null });
    }

    console.log(" Subscription found:", {
      userEmail: subscription.userEmail,
      planType: subscription.planType,
      expiryDate: subscription.expiryDate,
      subscribedAt: subscription.subscribedAt
    });

    res.status(200).json({ subscription });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.put("/api/request/return/:id", async (req, res) => {
  const { side } = req.body;
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.requestType !== "Borrow") {
      return res.status(400).json({ error: "Only borrow requests support return" });
    }

    switch (side) {
      case "sender":
        request.returnStatusBySender = true;
        break;
      case "ownerDirectYes":
      case "ownerConfirm":{
        request.returnedAt = new Date();
        request.returnStatusByOwner = true;
        request.returnStatusBySender = true;
        request.declineCount = 0;
        request.adminuc = false;
        const dueDate = new Date(request.endDate || request.startDate);
        const returnDate = new Date();
        const daysLate = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
        const borrower = await User.findOne({ email: request.requesterEmail });
        if (borrower) {
          let trustChange = 0;
          if (daysLate <= 0) trustChange = +5;
          else if (daysLate <= 2) trustChange = -2;
          else if (daysLate <= 6) trustChange = -5;
          else trustChange = -10;
          borrower.trustScore = Math.min(100, Math.max(0, borrower.trustScore + trustChange));
          await borrower.save();
        }
        break;
      }
      case "ownerDecline":
        request.returnStatusByOwner = false;
        request.returnStatusBySender = false;
        request.declineCount = (request.declineCount || 0) + 1;
        if (request.declineCount >= 3) request.adminuc = true;
        break;
      default:
        break;
    }

    await request.save();
    res.json({ message: "Return status updated successfully", request });
  } catch (err) {
    console.error("Error updating return:", err);
    res.status(500).json({ error: err.message });
  }
});
// Automatic 1-day escalation cron (periodically)
app.put("/api/request/autoAdminEscalation", async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const requests = await Request.updateMany(
      {
        requestType: "Borrow",
        status: "Accepted",
        returnStatusBySender: true,
        returnedAt: null,
        ownerReturnRequestTime: { $lte: oneDayAgo },
      },
      { adminuc: true }
    );
    res.json({ updated: requests.nModified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.put("/api/user/trust/:email", async (req, res) => {
  const { change } = req.body; // change can be +5, 0, or -5

  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Adjust and cap the trust score between 0 and 100
    let newScore = (user.trustScore || 50) + (change || 0);
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0;

    user.trustScore = newScore;
    await user.save();

    res.json({
      message: "Trust score updated successfully",
      email: user.email,
      newTrustScore: user.trustScore,
    });
  } catch (err) {
    console.error("Error updating trust score:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/user/trust/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ email: user.email, trustScore: user.trustScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/user/rate", async (req, res) => {
  try {
    const { from, to, score, role } = req.body;

    const ratedUser = await User.findOne({ email: to });
    const ratingUser = await User.findOne({ email: from });

    if (!ratedUser || !ratingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Save rating records
    ratingUser.ratingsGiven.push({ to, score, role });
    ratedUser.ratingsReceived.push({ from, score, role });

    // Adjust trust score based on rating
    let trustChange = 0;
    if (score >= 4) trustChange = +5;
    else if (score === 3) trustChange = 0;
    else trustChange = -5;

    ratedUser.trustScore = Math.min(100, Math.max(0, ratedUser.trustScore + trustChange));

    await ratedUser.save();
    await ratingUser.save();

    res.json({ message: "Feedback recorded successfully", trustScore: ratedUser.trustScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
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


