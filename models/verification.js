import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model('Verification', VerificationSchema);
