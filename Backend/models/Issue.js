import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priority: String,
    issueType: String,
    address: String,
    location: {
      lat: Number,
      lng: Number,
    },
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);
