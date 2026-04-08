require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Bookmark = require('./models/Bookmark');

const app = express();

app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// GET bookmarks
app.get('/bookmarks', async (req, res) => {
  const bookmarks = await Bookmark.find();
  res.json(bookmarks);
});

// POST bookmark
app.post('/bookmarks', async (req, res) => {
  const newBookmark = new Bookmark(req.body);
  await newBookmark.save();
  res.json(newBookmark);
  console.log("Saving to DB:", req.body);
});

// DELETE bookmark
app.delete('/bookmarks/:id', async (req, res) => {
  await Bookmark.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});