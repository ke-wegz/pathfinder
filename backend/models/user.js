const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core Account Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Standard', 'Expert', 'Admin'],
    default: 'Standard'
  },
  
  // Embedded Profile Data (FR3)
  location: String,
  personalInfo: {
    education: [String],
    interests: [String],
    skills: [String],
    experience: [String],
    careerGoals: [String]
  },

  // Metadata from Schema
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);