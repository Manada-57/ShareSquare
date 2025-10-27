import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  postTitle: { type: String, required: true },
  requestType: { type: String, enum: ["Borrow", "Exchange"], required: true },
  requesterEmail: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // optional (only Borrow)
  returnStatusBySender: { type: Boolean, default: false },
  returnStatusByOwner: { type: Boolean, default: false },
  returnedAt: { type: Date },
  adminuc: { type: Boolean, default: false }, // escalated to admin
  declineCount: { type: Number, default: 0 },
  ownerReturnRequestTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Request", requestSchema);
