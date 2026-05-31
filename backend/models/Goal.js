const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Career', 'Academic', 'Skill', 'Personal'], 
    required: true 
  },
  priority: { type: Number, min: 1, max: 3 }, // 1: Low, 2: Medium, 3: High
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);