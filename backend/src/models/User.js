import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phone: { type: String },
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
