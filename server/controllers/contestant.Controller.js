const Contestant = require('../models/Contestant');
const path = require('path');

// @desc    Get public approved contestants
// @route   GET /api/contestants
// @access  Public
exports.getContestants = async (req, res) => {
    try {
        const contestants = await Contestant.find({ status: 'approved' }).sort({ createdAt: 1 });
        return res.status(200).json(contestants);
    } catch (error) {
        console.error('Error getting contestants:', error);
        return res.status(500).json({ message: 'Server error while fetching contestants' });
    }
};

// @desc    Get all contestants (Admin)
// @access  Private/Admin
exports.getAllContestantsAdmin = async (req, res) => {
    try {
        const contestants = await Contestant.find({}).sort({ createdAt: -1 });
        return res.status(200).json(contestants);
    } catch (error) {
        console.error('Error getting all contestants:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single contestant (Admin)
// @access  Private/Admin
exports.getContestantByIdAdmin = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }
        return res.status(200).json(contestant);
    } catch (error) {
        console.error('Error getting contestant:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get logged in user's latest application
// @route   GET /api/contestants/my-application
// @access  Private
exports.getMyApplication = async (req, res) => {
    try {
        const email = (req.user?.email || '').trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Authenticated user email is required' });
        }

        const contestant = await Contestant.findOne({ email }).sort({ createdAt: -1 });
        if (!contestant) {
            return res.status(200).json({ hasApplication: false });
        }

        return res.status(200).json({ hasApplication: true, data: contestant });
    } catch (error) {
        console.error('Error getting user application:', error);
        return res.status(500).json({ message: 'Server error while fetching application status' });
    }
};

// @desc    Update contestant (Admin)
// @access  Private/Admin
exports.updateContestant = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        const updatedContestant = await Contestant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, data: updatedContestant });
    } catch (error) {
        console.error('Error updating contestant:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const User = require('../models/User');
const Vote = require('../models/Vote');

// @desc    Delete contestant (Admin)
// @access  Private/Admin
exports.deleteContestant = async (req, res) => {
    try {
        const contestantId = req.params.id;
        const contestant = await Contestant.findById(contestantId);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        const category = contestant.talentType;

        // Find users who specifically voted for this contestant
        const affectedUsers = await User.find({ votedContestants: contestantId });
        
        for (let user of affectedUsers) {
            // Remove the specific contestant from array
            user.votedContestants = user.votedContestants.filter(id => id.toString() !== contestantId.toString());
            
            // Re-evaluate category locks precisely since admin deleted the entry
            // This safely forces users to vote again in that category
            user.votedCategories = user.votedCategories.filter(cat => cat !== category);
            
            // Complete reset if no votes left across any category
            if (user.votedCategories.length === 0) {
                user.isVoted = false;
            }
            await user.save();
        }

        // Delete all corresponding votes cast for this person
        await Vote.deleteMany({ contestantId });

        // Proceed to delete the actual contestant entry
        await contestant.deleteOne();
        
        return res.status(200).json({ success: true, message: 'Contestant and associated votes successfully removed' });
    } catch (error) {
        console.error('Error deleting contestant:', error);
        return res.status(500).json({ message: 'Server error while attempting to delete contestant details' });
    }
};

// @desc    Register a contestant
// @route   POST /api/contestants
// @access  Public
exports.registerContestant = async (req, res) => {
    const {
        name,
        universityId,
        email,
        year,
        semester,
        talentType,
        description,
        mobileNumber,
        mobile
    } = req.body;

    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];
    const resolvedMobileNumber = (mobileNumber || mobile || '').trim();

    if (!name || !universityId || !email || !resolvedMobileNumber || !year || !semester || !talentType) {
        return res.status(400).json({
            message: 'name, universityId, email, mobileNumber, year, semester and talentType are required'
        });
    }

    if (!imageFile || !videoFile) {
        return res.status(400).json({ message: 'Image and video files are required' });
    }

    if (imageFile.size > (3 * 1024 * 1024)) {
        return res.status(400).json({ message: 'Image file must be less than 3 MB' });
    }

    if (videoFile.size > (50 * 1024 * 1024)) {
        return res.status(400).json({ message: 'Video file must be less than 50 MB' });
    }

    try {
        const normalizedUniversityId = universityId.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const existing = await Contestant.findOne({ universityId: normalizedUniversityId });
        if (existing) {
            const canReapply = existing.status === 'rejected' && (existing.email || '').toLowerCase() === normalizedEmail;
            if (!canReapply) {
                return res.status(400).json({ message: 'Contestant with this universityId already exists' });
            }

            const imageUrl = path.posix.join('/uploads/contestants', imageFile.filename);
            const videoUrl = path.posix.join('/uploads/contestants', videoFile.filename);

            existing.name = name;
            existing.email = normalizedEmail;
            existing.mobileNumber = resolvedMobileNumber;
            existing.year = year;
            existing.semester = semester;
            existing.talentType = talentType;
            existing.description = description;
            existing.imageUrl = imageUrl;
            existing.videoUrl = videoUrl;
            existing.status = 'pending';
            existing.remarks = '';

            await existing.save();

            return res.status(200).json({
                success: true,
                reApplied: true,
                data: existing
            });
        }

        const imageUrl = path.posix.join('/uploads/contestants', imageFile.filename);
        const videoUrl = path.posix.join('/uploads/contestants', videoFile.filename);

        const contestant = await Contestant.create({
            name,
            universityId: normalizedUniversityId,
            email: normalizedEmail,
            mobileNumber: resolvedMobileNumber,
            year,
            semester,
            talentType,
            description,
            imageUrl,
            videoUrl,
            status: 'pending' // Default to pending
        });

        return res.status(201).json({
            success: true,
            data: contestant
        });
    } catch (error) {
        console.error('Error registering contestant:', error);
        return res.status(500).json({ message: 'Server error while registering contestant' });
    }
};

// @desc    Submit a score from a judge
// @route   PUT /api/contestants/:id/score
// @access  Private/Judge
exports.submitJudgeScore = async (req, res) => {
    try {
        const { score } = req.body;
        const judgeId = req.user._id;
        const contestantId = req.params.id;

        if (score === undefined || score < 0 || score > 100) {
            return res.status(400).json({ message: 'Valid score between 0 and 100 is required' });
        }

        const contestant = await Contestant.findById(contestantId);
        if (!contestant) {
            return res.status(404).json({ message: 'Contestant not found' });
        }

        // Pull any existing score from this judge to avoid duplicates
        await Contestant.updateOne(
            { _id: contestantId },
            { $pull: { judgeScores: { judgeId } } }
        );

        // Push the new score using the $push operator
        const updatedContestant = await Contestant.findByIdAndUpdate(
            contestantId,
            { $push: { judgeScores: { judgeId, score } } },
            { new: true, runValidators: true }
        );

        return res.status(200).json({ success: true, data: updatedContestant });
    } catch (error) {
        console.error('Error submitting judge score:', error);
        return res.status(500).json({ message: 'Server error while submitting score' });
    }
};
