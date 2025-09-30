import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterEmail: { 
    type: String, 
    required: true // Email of the user who is reporting
  },
  reportedEmail: { 
    type: String, 
    required: true // Email of the user being reported
  },
  reason: { 
    type: String, 
    enum: ["Spam", "Inappropriate Content", "Harassment", "Fake Post", "Others"], 
    required: true 
  },
  otherReason: { 
    type: String, 
    default: "" // This will be filled if reason is "Others"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Report", reportSchema);