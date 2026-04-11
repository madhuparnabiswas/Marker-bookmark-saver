require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Bookmark = require('./models/Bookmark');

const app = express();

// Guard: fail fast if MONGO_URI is missing
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// GET all bookmarks
app.get('/bookmarks', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find();
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// POST a new bookmark
app.post('/bookmarks', async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'title and url are required' });
    }

    const newBookmark = new Bookmark({ title, url });
    await newBookmark.save();

    console.log('Saved to DB:', newBookmark);
    res.status(201).json(newBookmark);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
});

// PUT (edit) a bookmark by ID
app.put('/bookmarks/:id', async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'title and url are required' });
    }

    const updated = await Bookmark.findById(req.params.id);

    if (!updated) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    updated.title = title;
    updated.url = url;
    await updated.save({ validateBeforeSave: false });
  } catch (err) {
    console.error('PUT error:', err.message);
    res.status(400).json({ error: 'Invalid ID or update failed' });
  }
});

// DELETE a bookmark by ID
app.delete('/bookmarks/:id', async (req, res) => {
  try {
    const deleted = await Bookmark.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID or delete failed' });
  }
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});