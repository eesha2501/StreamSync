// server/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose.connect returns a promise, so we await it
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit the process with failure
        process.exit(1);
    }
};

module.exports = connectDB;