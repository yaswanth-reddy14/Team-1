import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Auth Middleware - Decoded JWT:', payload);

    // Try different possible fields for user ID
    // Your JWT seems to have 'sub' but auth middleware expects 'id'
    const userId = payload.id || payload.sub || payload.userId || payload._id;

    if (!userId) {
      console.error('No user ID found in JWT payload:', payload);
      return res.status(401).json({ message: 'Invalid token: No user ID found' });
    }

    req.userId = userId;
    req.user = payload; // Store the entire payload

    console.log('Auth Middleware - Set req.userId to:', req.userId);

    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
