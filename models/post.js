import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // email instead of userId
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: String,
  condition: String,
  tags: [String],
  location: String,
  contactPrefs: [String],
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);
