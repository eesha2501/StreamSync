 const User = require('../models/userModel');
    const Video = require('../models/videoModel');

    const getPersonalizedSequence = async (req, res) => {
        try {
            const now = new Date();
            
            // Get the main sequence of all currently "live" videos
            const sequence = await Video.find({
                status: 'published',
                publishAt: { $lte: now },
                $or: [
                    { liveEndTime: { $exists: false } },
                    { liveEndTime: null },
                    { liveEndTime: { $gte: now } }
                ]
            }).sort({ createdAt: 'asc' });

            // --- THIS IS THE NEW LOGIC ---
            // Separately, get up to 3 videos marked for the hero section
            const heroVideos = await Video.find({
                sections: 'hero',
                status: 'published',
                publishAt: { $lte: now }
            }).sort({ createdAt: -1 }).limit(3); // Get the 3 newest hero videos


            if (!sequence || sequence.length === 0) {
                return res.json({
                    sequence: [],
                    heroVideos: [], // Also return empty hero videos
                    nowPlayingIndex: null,
                    startTime: 0,
                    message: "No videos are currently live."
                });
            }

            // The rest of the sync logic remains the same
            const globalStartTime = new Date(process.env.GLOBAL_START_TIME);
            const totalElapsedSeconds = Math.floor((now - globalStartTime) / 1000);
            const totalSequenceDuration = sequence.reduce((acc, video) => acc + video.duration, 0);

            if (totalSequenceDuration <= 0) {
                 return res.json({ sequence, heroVideos, nowPlayingIndex: null, startTime: 0, message: "Sequence has no playable videos." });
            }

            const elapsedInLoopedSequence = totalElapsedSeconds % totalSequenceDuration;
            let cumulativeDuration = 0;
            let currentVideoIndex = -1;
            let timeIntoCurrentVideo = 0;

            for (let i = 0; i < sequence.length; i++) {
                const videoDuration = sequence[i].duration;
                if (elapsedInLoopedSequence < cumulativeDuration + videoDuration) {
                    currentVideoIndex = i;
                    timeIntoCurrentVideo = elapsedInLoopedSequence - cumulativeDuration;
                    break;
                }
                cumulativeDuration += videoDuration;
            }

            res.json({ sequence, heroVideos, nowPlayingIndex: currentVideoIndex, startTime: timeIntoCurrentVideo });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    };
const searchVideos = async (req, res) => {
    const keyword = req.query.q ? {
        title: {
            $regex: req.query.q,
            $options: 'i'
        }
    } : {};

    try {
        const videos = await Video.find({ ...keyword, status: 'published' });
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (video) {
            // We can still get the full sequence for the "Up Next" feature
            const sequence = await Video.find({ status: 'published', publishAt: { $lte: new Date() } }).sort({ createdAt: 'asc' });
            res.json({ video, sequence });
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPersonalizedSequence, searchVideos, getVideoById };
