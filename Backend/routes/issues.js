// Backend/routes/issues.js
import express from 'express';
import upload from '../middleware/upload.js';
import cloudinary from '../utils/cloudinary.js';
import Issue from '../models/Issue.js';
const router = express.Router();

// POST /api/issues/create
router.post(
  '/create',
  upload.array('images', 5),
  async (req, res) => {
    try {
      const {
        title,
        description,
        priority,
        issueType,
        address,
        location,
      } = req.body;

      const parsedLocation = location ? JSON.parse(location) : null;
      const imageUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            { folder: 'report_issues' }
          );
          imageUrls.push(result.secure_url);
        }
      }

      const issue = await Issue.create({
        title,
        description,
        priority,
        issueType,
        address,
        location: parsedLocation,
        images: imageUrls,
      });

      return res.status(201).json(issue);
    } catch (error) {
      console.error('Create issue error:', error);
      return res.status(500).json({ message: 'Failed to create issue' });
    }
  });

export default router;
