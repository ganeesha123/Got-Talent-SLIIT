const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  universityId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  year: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  talentType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  votes: {
    type: Number,
    default: 0,
  },
  judgeScores: [{
    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true
    }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Contestant', contestantSchema);
