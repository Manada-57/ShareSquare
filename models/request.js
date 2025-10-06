import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  postTitle: {
    type: String,
    required: true,
  },
  requestType: {
    type: String,
    enum: ["Borrow", "Exchange"],
    required: true,
  },
  requesterEmail: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Request", requestSchema);