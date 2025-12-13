import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

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
    if (!match) return res.status(401).json({ message: "Current password incorrect" });

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
