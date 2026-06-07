const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const testError = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    const email = 'judge@sliit.lk';
    let user = await User.findOne({ email });
    console.log('User found:', user);
    user.otp = '123456';
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    console.log('Attempting save...');
    await user.save();
    console.log('Save successful');
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    process.exit(0);
  }
};
testError();
