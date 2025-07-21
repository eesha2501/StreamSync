// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: 'https://streamsync-web.vercel.app/' }));
app.use(express.json());

// --- NEW DEBUGGING MIDDLEWARE ---
// This will log every single request that comes into the server.
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// --- THE CORRECTED STATIC PATH ---
// This tells Express to serve files from the 'uploads' folder
// when a request comes in for '/uploads'.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.send('StreamSync API is running...');
});

// Mount the routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
