const express = require('express');
const router = express.Router();
const { loginUser, verifyOTP } = require('../controllers/auth.Controller');

router.post('/login', loginUser);
router.post('/verify', verifyOTP);

module.exports = router;
