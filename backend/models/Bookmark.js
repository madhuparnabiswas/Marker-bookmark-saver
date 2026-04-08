const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      unique: true,
      validate: {
        validator: (v) => {
          try { new URL(v); return true; }
          catch { return false; }
        },
        message: 'Invalid URL format'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bookmark', bookmarkSchema);