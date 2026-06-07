const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register/Login user with OTP
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email' });
  }

  // Validate SLIIT email
  const sliitEmailRegex = /@(my\.)?sliit\.lk$/;
  if (!sliitEmailRegex.test(email)) {
    return res.status(400).json({ message: 'Please use a valid SLIIT email (@sliit.lk or @my.sliit.lk)' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // Generate specific 6-digit OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    // DEV: Default OTP for admin and judge
    if (email === 'admin@sliit.lk' || email === 'judge@sliit.lk') {
      otp = '123456';
    }

    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`\n=== DEV MODE: OTP for ${email} is ${otp} ===\n`);

    const message = `Your OTP for SLIIT's Got Talent login is: ${otp}.\nIt expires in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SLIIT\'s Got Talent Login OTP',
        message,
      });

      res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
      console.error('Email send failed:', error.message);
      // In development, allow login even if email fails
      res.status(200).json({ 
        success: true, 
        message: 'Email failed. Check server console for OTP.',
        devOtp: otp 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // OTP is valid
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVoted: user.isVoted,
        votedCategories: user.votedCategories || [],
        votedContestants: user.votedContestants || [],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

