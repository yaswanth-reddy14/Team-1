import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    issueType: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    images: {
      type: [String],
      default: [],
    },

    // Voting
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    downvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    // Comments
    comments: {
      type: [commentSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['received', 'in-progress', 'resolved'],
      default: 'received',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);
