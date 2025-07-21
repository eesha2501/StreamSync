// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authControllers');

// Route for POST /api/auth/register
router.post('/register', registerUser);

// Route for POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;