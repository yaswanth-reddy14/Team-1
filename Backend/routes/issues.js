import express from 'express';
import upload from '../middleware/upload.js';
import cloudinary from '../utils/cloudinary.js';
import Issue from '../models/Issue.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/* ===================================================
   CREATE ISSUE
=================================================== */
router.post('/create', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, priority, issueType, address, location } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const parsedLocation = JSON.parse(location);

    const imageUrls = [];
    if (req.files?.length) {
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
      location: {
        lat: Number(parsedLocation.lat),
        lng: Number(parsedLocation.lng),
      },
      images: imageUrls,
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create issue' });
  }
});

/* ===================================================
   GET ALL ISSUES
=================================================== */
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('createdBy', '_id name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

/* ===================================================
   VOTE ON ISSUE (UPVOTE/DOWNVOTE TOGGLE)
=================================================== */
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;


    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be either "upvote" or "downvote"',
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.upvotes = (issue.upvotes || []).filter(v => v != null);
    issue.downvotes = (issue.downvotes || []).filter(v => v != null);

    const userIdStr = userId.toString();

    const isUpvoted = issue.upvotes
      .filter(v => v != null)
      .some(v => v.toString() === userIdStr);

    const isDownvoted = issue.downvotes
      .filter(v => v != null)
      .some(v => v.toString() === userIdStr);

    let updateOperations = {};
    let message = '';

    if (voteType === 'upvote') {
      if (isUpvoted) {
        updateOperations = { $pull: { upvotes: userId } };
        message = 'Upvote removed';
      } else {
        updateOperations = {
          $addToSet: { upvotes: userId },
          $pull: { downvotes: userId },
        };
        message = 'Upvote added';
      }
    } else if (voteType === 'downvote') {
      if (isDownvoted) {
        updateOperations = { $pull: { downvotes: userId } };
        message = 'Downvote removed';
      } else {
        updateOperations = {
          $addToSet: { downvotes: userId },
          $pull: { upvotes: userId },
        };
        message = 'Downvote added';
      }
    }

    console.log('Update operations:', updateOperations);

    await Issue.findByIdAndUpdate(id, updateOperations, {
      new: false, // we will fetch again
      runValidators: true,
    });

    // Now fetch full updated issue with all fields
    const updatedIssue = await Issue.findById(id)
      .populate('createdBy', '_id name role')
      .populate('comments.user', '_id name');

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found after update',
      });
    }

    res.json({
      success: true,
      message,
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Vote error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


// Add this route to your existing issue routes
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    const validStatuses = ['received', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: received, in-progress, or resolved'
      });
    }

    // Check if issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Update status
    issue.status = status;
    issue.updatedAt = Date.now();

    await issue.save();

    // Populate createdBy field if needed
    await issue.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: issue
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

/* ===================================================
   ADD COMMENT
=================================================== */
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.comments.push({
      user: req.userId,
      text,
    });

    await issue.save();
    await issue.populate('comments.user', '_id name');

    res.status(201).json({
      success: true,
      comments: issue.comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

/* ===================================================
   GET SINGLE ISSUE (FOR MODAL)
=================================================== */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', '_id name role')
      .populate('comments.user', '_id name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ success: true, data: issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
});

/* ===================================================
   UPDATE ISSUE (OWNER ONLY)
=================================================== */
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, priority, issueType, address, location } = req.body;

    if (location) {
      const parsed = JSON.parse(location);
      issue.location = {
        lat: Number(parsed.lat),
        lng: Number(parsed.lng),
      };
    }

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          { folder: 'report_issues' }
        );
        issue.images.push(result.secure_url);
      }
    }

    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.priority = priority ?? issue.priority;
    issue.issueType = issueType ?? issue.issueType;
    issue.address = address ?? issue.address;

    await issue.save();
    await issue.populate('createdBy', '_id name role');

    res.json({ success: true, data: issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update issue' });
  }
});

router.put('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    const issueId = req.params.id;

    if (req.userRole !== 'Admin' && req.userRole !== 'Volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin or Volunteer can update progress',
      });
    }

    const allowedProgress = ['REPORTED', 'IN_PROGRESS', 'RESOLVED'];
    if (!allowedProgress.includes(progress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress value',
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    issue.progress = progress;
    await issue.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: issue.progress,
    });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress',
    });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const issueId = req.params.id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    const isOwner = issue.createdBy.toString() === req.userId;
    const isAdmin = req.userRole === 'Admin';

    // ✅ Only creator OR Admin can delete
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint',
      });
    }

    await issue.deleteOne();

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (err) {
    console.error('Delete issue error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting complaint',
    });
  }
});



export default router;
