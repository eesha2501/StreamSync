
// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
// --- THIS IS THE FIX: Added 'getVideoById' to the import ---
const { getPersonalizedSequence, searchVideos, getVideoById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sequence', protect, getPersonalizedSequence);
router.get('/search', protect, searchVideos);
router.get('/videos/:id', protect, getVideoById); // This line will now work

module.exports = router;
