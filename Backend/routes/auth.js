import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   REGISTER (DOMAIN-SPECIFIC)
   ===================================================== */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      location,
      password,
      role
    } = req.body;

    if (!email || !password || !name || !username || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailLower = email.toLowerCase();

    // 🔒 DOMAIN RULES
    if (role === "Admin" && !emailLower.endsWith("@civix.com")) {
      return res.status(400).json({
        message: "Admin registration requires @civix.com email"
      });
    }

    if (role === "Volunteer" && !emailLower.endsWith("@volunteer.civix.com")) {
      return res.status(400).json({
        message: "Volunteer registration requires @volunteer.civix.com email"
      });
    }

    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email: emailLower,
      phone,
      location,
      passwordHash,
      role: role || "User"
    });

    await user.save();

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   CHANGE PASSWORD (UNCHANGED)
   ===================================================== */
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error("change-password error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
