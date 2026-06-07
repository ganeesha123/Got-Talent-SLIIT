require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vote = require('./models/Vote');
const connectDB = require('./config/db');

async function resetVotes() {
  await connectDB();
  console.log('Resetting all votes...');
  
  await Vote.deleteMany({});
  console.log('Cleared Vote collection.');

  await User.updateMany({}, {
    $set: { isVoted: false, votedCategories: [], votedContestants: [] }
  });
  console.log('Reset all Users voting state.');

  process.exit(0);
}

resetVotes();
