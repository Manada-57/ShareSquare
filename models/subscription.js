import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  planType: { type: String, default: "Premium" }, 
  days: { type: Number, required: true }, 
  subscribedAt: { type: Date, default: Date.now }, 
  expiryDate: { type: Date, required: true }, 
  paymentId: { type: String }, 
});

export default mongoose.model("Subscription", subscriptionSchema);
