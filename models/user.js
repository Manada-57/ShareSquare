import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobileNumber: String,
  gender: String,
  country: String,
  state: String,
  city: String
});
const User = mongoose.model('User', userSchema);
export default User;
