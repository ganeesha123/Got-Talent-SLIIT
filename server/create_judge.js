const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createJudge = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'judge@sliit.lk';
    let user = await User.findOne({ email });

    if (user) {
      user.role = 'judge';
      await user.save();
      console.log(`Updated existing user ${email} to judge.`);
    } else {
      user = new User({
        email,
        role: 'judge'
      });
      await user.save();
      console.log(`Created new judge user ${email}.`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createJudge();
