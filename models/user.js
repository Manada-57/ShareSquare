import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
    ratingsGiven: [
    {
      to: String,
      score: Number,
      role: String,
    },
  ],
  ratingsReceived: [
    {
      from: String,
      score: Number,
      role: String,
    },
  ],
  reports: { type: Number, default: 0 },
  mobileNumber: String,
  gender: String,
  country: String,
  state: String,
  city: String,
  username: String,           
  bio: String,                
  profilePic: String,         
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema);
export default User;