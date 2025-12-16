import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;

    next();
  } catch (err) {
    console.error("authMiddleware error", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
