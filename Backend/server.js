// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import issueRoutes from './routes/issues.js';
import authRoutes from './routes/auth.js';


dotenv.config();
const app = express();

/**
 * CORS - allow explicit frontends (comma separated in env)
 * Default supports common Vite ports for dev: 5173 & 5174
 */
const FRONTEND_ORIGIN = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests from tools (no origin) like curl/postman
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGIN.indexOf(origin) !== -1) return callback(null, true);
    console.warn(`CORS: origin ${origin} not allowed (allowed: ${FRONTEND_ORIGIN.join(", ")})`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// parse JSON (limit keeps requests reasonable)
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "replace_me";

if (!MONGO_URI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  dbName: "civix",
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

/**
 * verifyToken middleware
 */
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    return next();
  } catch (err) {
    console.error("verifyToken error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * POST /api/auth/register
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, phone, password, role = "User", location = "" } = req.body || {};

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).toLowerCase().trim();

    if (await User.findOne({ email: cleanEmail })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    if (await User.findOne({ username: cleanUsername })) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: String(name).trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "",
      passwordHash,
      role,
      location: location ? String(location).trim() : ""
    });

    await user.save();

    const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "6h" });

    return res.status(201).json({
      message: "User created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * Accepts: { identifier, password, role }
 * identifier = email OR username
 * If provided role does not match stored user.role => 403
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password, role } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ message: "Missing identifier or password" });

    const id = String(identifier).trim();
    const query = id.includes("@") ? { email: id.toLowerCase() } : { username: id.toLowerCase() };

    // include passwordHash explicitly (model likely has select:false)
    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    // optional role check (frontend now sends selected role)
    if (role && String(user.role) !== String(role)) {
      // mismatch: user exists but role doesn't match
      return res.status(403).json({ message: "Selected role does not match account" });
    }

    if (!user.passwordHash) {
      console.error("Login error: user has no passwordHash:", user._id);
      return res.status(500).json({ message: "Server error" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/auth/me
 */
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Me error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/auth/update
 */
app.put("/api/auth/update", verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.name === "string") updates.name = req.body.name.trim();
    if (typeof req.body.phone === "string") updates.phone = req.body.phone.trim();
    if (typeof req.body.location === "string") updates.location = req.body.location.trim();

    if (req.body.hasOwnProperty("image")) {
       updates.image = req.body.image || "";
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update error", err);
    return res.status(500).json({ message: "Server error" });
  }
});



/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
app.put("/api/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(req.userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Current password incorrect" });

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error("Change-password error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/auth/delete
 */
app.delete("/api/auth/delete", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Delete error", err);
    return res.status(500).json({ message: "Server error" });
  }
});
/**
 * Issue routes (Report Issue)
 * Protected by verifyToken
 */
app.use('/api/issues', verifyToken, issueRoutes);

// start server
app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
