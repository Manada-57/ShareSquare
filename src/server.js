import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/user.js';
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json()); // To parse JSON body
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