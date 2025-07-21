// server/controllers/adminController.js
const User = require('../models/userModel');
const Video = require('../models/videoModel');
const fs = require('fs');
const path = require('path');

// --- Video Management ---

const uploadVideo = async (req, res) => {
    const { title, duration, description, publishAt, liveEndTime, sections } = req.body;
    const videoFile = req.files.video ? req.files.video[0] : null;
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (!videoFile || !thumbnailFile) {
        return res.status(400).json({ message: 'Please upload both a video and a thumbnail file.' });
    }

    try {
        const video = new Video({
            title,
            duration,
            description,
            url: `/uploads/${videoFile.filename}`,
            thumbnail: `/uploads/${thumbnailFile.filename}`,
            publishAt: publishAt || Date.now(),
            liveEndTime: liveEndTime || null,
            status: 'published',
            sections: sections ? JSON.parse(sections) : []
        });
        
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Server error during video upload.' });
    }
};

const updateVideo = async (req, res) => {
    const { title, duration, description, publishAt, liveEndTime, sections } = req.body;
    try {
        const video = await Video.findById(req.params.id);
        if (video) {
            video.title = title || video.title;
            video.duration = duration || video.duration;
            video.description = description || video.description;
            video.sections = sections ? JSON.parse(sections) : video.sections;
            video.publishAt = publishAt || video.publishAt;
            video.liveEndTime = liveEndTime === '' ? null : liveEndTime || video.liveEndTime;
            
            const now = new Date();
            if (new Date(video.publishAt) > now) {
                video.status = 'scheduled';
            } else if (video.liveEndTime && new Date(video.liveEndTime) < now) {
                video.status = 'archived';
            } else {
                video.status = 'published';
            }

            // Handle file updates if new ones are provided
            if (req.files) {
                if (req.files.video) {
                    // Optional: Delete old video file
                    const oldVideoPath = path.join(__dirname, '..', video.url);
                    if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
                    video.url = `/uploads/${req.files.video[0].filename}`;
                }
                if (req.files.thumbnail) {
                    // Optional: Delete old thumbnail file
                    const oldThumbnailPath = path.join(__dirname, '..', video.thumbnail);
                    if (fs.existsSync(oldThumbnailPath)) fs.unlinkSync(oldThumbnailPath);
                    video.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
                }
            }

            await video.save();
            res.json(video);
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (video) {
            const videoPath = path.join(__dirname, '..', video.url);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            
            const thumbnailPath = path.join(__dirname, '..', video.thumbnail);
            if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

            await video.deleteOne();
            res.json({ message: 'Video removed successfully' });
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- User Management ---

const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const user = await User.create({ name, email, password, role });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete an admin user.' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- Analytics ---

const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVideos = await Video.countDocuments();
        const userRoles = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $project: { _id: 0, role: '$_id', count: '$count' } }
        ]);
        const activeUsers = Math.floor(Math.random() * (totalUsers > 0 ? totalUsers : 1));
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyRegistrations = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const allVideos = await Video.find({});
        const totalDurationSeconds = allVideos.reduce((acc, video) => acc + video.duration, 0);
        const simulatedViewsFactor = (Math.random() * 25) + 10;
        const totalWatchTimeMinutes = Math.floor((totalDurationSeconds * simulatedViewsFactor) / 60);

        res.json({ 
            totalUsers, 
            totalVideos, 
            userRoles, 
            activeUsers,
            dailyRegistrations,
            totalWatchTimeMinutes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    uploadVideo,
    updateVideo,
    deleteVideo,
    getAllVideos,
    createUser,
    updateUserRole,
    deleteUser,
    getAllUsers,
    getAnalytics
};
