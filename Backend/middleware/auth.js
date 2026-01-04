import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

export default async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const userId = payload.id || payload.sub || payload.userId || payload._id;

    if (!userId) {
      console.error('No user ID found in JWT payload:', payload);
      return res.status(401).json({ message: 'Invalid token: No user ID found' });
    }
const user = await User.findById(userId).select('-password');

if (!user) {
  return res.status(401).json({ message: 'User not found' });
}

req.user = user;        // full user object
req.userId = user._id; // user id

next();
   
    req.user = payload;
   
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
