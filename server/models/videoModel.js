    // server/models/videoModel.js
    const mongoose = require('mongoose');

    const VideoSchema = new mongoose.Schema({
        title: { type: String, required: true },
        description: { type: String, default: 'No description available.' },
        url: { type: String, required: true },
        thumbnail: { type: String, required: true },
        duration: { type: Number, required: true },
        status: { type: String, enum: ['published', 'scheduled', 'archived'], default: 'published' },
        publishAt: { type: Date, default: Date.now }, // When the video becomes visible
        liveEndTime: { type: Date }, // NEW: When the video stops being "live"
        sections: [{ type: String, enum: ['featured', 'live', 'upcoming', 'hero'] }],
    }, { timestamps: true });
     

    module.exports = mongoose.model('Video', VideoSchema);
    