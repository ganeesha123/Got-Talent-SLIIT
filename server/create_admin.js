const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'admin@sliit.lk';
    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Updated existing user ${email} to admin.`);
    } else {
      user = new User({
        email,
        role: 'admin'
      });
      await user.save();
      console.log(`Created new admin user ${email}.`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();