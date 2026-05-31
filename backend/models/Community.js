const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  topic: { type: String },
  likes_count: { type: Number, default: 0 },
  comments_count: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);