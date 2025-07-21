// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    uploadVideo, updateVideo, deleteVideo,
    getAllUsers, getAllVideos, createUser, updateUserRole, deleteUser, getAnalytics
} = require('../controllers/adminController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// This middleware handles the multipart form data for both video and thumbnail
const cpUpload = upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]);

// Apply security middleware to all routes in this file
router.use(protect, admin);

// Video Management Routes
router.route('/videos')
    .get(getAllVideos)
    .post(cpUpload, uploadVideo); // Use cpUpload for creating new videos

router.route('/videos/:id')
    // --- THIS IS THE FIX ---
    // The cpUpload middleware is now correctly added to the 'put' route
    .put(cpUpload, updateVideo)
    .delete(deleteVideo);

// User Management Routes
router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .put(updateUserRole)
    .delete(deleteUser);

// Analytics Route
router.get('/analytics', getAnalytics);

module.exports = router;
