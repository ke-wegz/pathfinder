const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  history: { type: String, required: true }, // Stores the chat back-and-forth
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AISession', aiSessionSchema);