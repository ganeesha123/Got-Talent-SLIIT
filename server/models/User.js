const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /@(my\.)?sliit\.lk$/, // Ensure SLIIT email
  },
  role: {
    type: String,
    enum: ['student', 'manager', 'admin', 'judge'],
    default: 'student',
  },
  votedCategories: {
    type: [String],
    default: [],
  },
  votedContestants: {
    type: [String],
    default: [],
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

