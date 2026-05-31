const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalID: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }, // Optional: link to a specific goal
  commentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // Optional: link to a social alert
  title: { type: String, required: true },
  body: { type: String },
  type: { type: String, default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);