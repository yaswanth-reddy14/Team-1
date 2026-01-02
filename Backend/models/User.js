// backend/models/User.js
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: { validator: (v) => validator.isEmail(v), message: "Invalid email" }
  },
  phone: { type: String, default: "" },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, default: "User" },
  location: { type: String, default: "" },
  image: { type: String, default: "" } 
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
