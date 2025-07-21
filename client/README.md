StreamSync: A Full-Stack Synchronized Streaming Platform
StreamSync is a complete MERN stack web application that simulates a global, personalized streaming experience. Its core feature is a universal clock that synchronizes video playback for all users, creating a shared, "live TV" feel for personally curated content.

The platform features a sleek, Netflix-inspired user dashboard, a beautiful public landing page, and a powerful, data-driven admin panel for complete control over users and content.

Core Features
User Experience
Stunning Landing Page: A fully responsive, modern landing page to attract new users.

Popup Authentication: A seamless login and registration experience through a glass-effect modal.

Netflix-Style Dashboard: An immersive, dark-themed dashboard with a left-side icon-based navigation.

Dynamic Hero Carousel: An auto-playing carousel in the hero section showcasing up to three admin-selected videos.

Content Carousels: Videos are organized into dynamic, horizontally-scrolling rows:

Live Now: Videos currently within their scheduled live window.

Featured: Admin-selected videos for promotion.

Upcoming: Videos scheduled to go live in the future.

Functional Search: A full-page search overlay to find videos by title.

"My Library" Page: A dedicated section within the dashboard for users to view content they've saved.

Immersive Video Player: A dedicated, full-screen player page for watching selected content.

Static Pages: Fully styled pages for FAQ, Terms of Use, and Privacy Policy.

Admin Panel
Professional Layout: A dedicated admin dashboard with a persistent sidebar for easy navigation.

Real-Time Analytics: The main dashboard displays key metrics:

Total Users & Total Videos.

A real-data line graph showing new user registrations over the last 7 days.

A doughnut chart showing the breakdown of users by role.

Simulated "Active Now" and "Total Watch Time" stats.

User Management: Admins have full CRUD (Create, Read, Update, Delete) capabilities for users, including the ability to change a user's role between 'user' and 'admin'.

Content Management: Admins have full control over the video library:

Add/Edit Content Modal: A powerful popup form to upload new videos and thumbnails.

Advanced Scheduling: Set a "Live From" and "Live Until" date and time for each video. Videos automatically appear and disappear from the user view based on this schedule.

Section Assignment: Use checkboxes to assign videos to appear in the "Hero Carousel," "Live Now," "Featured," or "Upcoming" sections.

Tech Stack
Frontend: React (with Hooks & Context API), React Router, Axios, Chart.js

Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Authentication: JSON Web Tokens (JWT)

File Uploads: Multer

Folder Structure
/streamsync
├── client/         # React Frontend
│   ├── public/
│   │   └── logo.png
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.js
│       └── index.js
│
└── server/         # Node.js Backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── uploads/      # Stores uploaded videos & thumbnails
    └── server.js

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or later)

npm (comes with Node.js)

MongoDB (for local development)

Local Development Setup
Follow these steps to get the project running on your local machine.

1. Backend Setup
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create the environment file
# On Windows (Command Prompt)
copy .env.example .env
# On Mac/Linux
cp .env.example .env

Now, open the newly created .env file and fill in your details.
server/.env

PORT=5000
MONGO_URI=mongodb://localhost:27017/streamsync
JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random
GLOBAL_START_TIME=2025-01-01T00:00:00Z

2. Frontend Setup
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Create the environment file
# On Windows (Command Prompt)
copy .env.example .env
# On Mac/Linux
cp .env.example .env

Now, open the newly created .env file and ensure it points to your local backend.
client/.env

REACT_APP_API_URL=http://localhost:5000/api

3. Add Your Logo
Place your logo image inside the client/public/ folder and name it logo.png.

Running the Application
You will need two separate terminals to run both the frontend and backend servers.

Terminal 1: Start the Backend

# Navigate to the server directory
cd server

# Start the server with nodemon (auto-restarts on changes)
nodemon server.js

You should see the messages: Server is running... and MongoDB Connected...

Terminal 2: Start the Frontend

# Navigate to the client directory
cd client

# Start the React development server
npm start

Your browser will automatically open to http://localhost:3000, where you will see the landing page.

You are now ready to use the application! You can register a new user, make that user an admin directly in your MongoDB database, and start exploring the features.