const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'AISession', required: true },
  title: { type: String, required: true }, // e.g., "Full Stack Developer Roadmap"
  content: { type: String, required: true }, // The AI-generated JSON or text data
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);