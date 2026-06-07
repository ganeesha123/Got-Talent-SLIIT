const express = require('express');
const router = express.Router();
const { castVote, getVoteStats } = require('../controllers/vote.Controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
router.post('/', protect, authorize('student'), castVote);
router.get('/stats', getVoteStats);

module.exports = router;
