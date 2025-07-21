# 📺 StreamSync: A Full-Stack Synchronized Streaming Platform

**StreamSync** is a complete MERN stack web application that simulates a global, personalized streaming experience. The standout feature is a **universal clock** that synchronizes video playback for all users — delivering a shared, "live TV" feeling for personally curated content.

The platform features a stunning, responsive landing page, a sleek Netflix-inspired user dashboard, and a powerful, data-driven admin panel for complete control over users and content.

---

## 🧰 Tech Stack

- **Frontend**: React (Hooks + Context API), React Router, Axios, Chart.js  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB with Mongoose  
- **Authentication**: JSON Web Tokens (JWT)  
- **File Uploads**: Multer

---

## 🧑‍💻 Features

### 🖥 User Experience

- 🎬 **Stunning Landing Page**: Fully responsive, modern design to attract users.
- 🔐 **Popup Authentication**: Glass-effect login/register modal.
- 📺 **Netflix-Style Dashboard**: Dark theme, icon-based sidebar.
- 🎞 **Dynamic Hero Carousel**: Auto-playing slider showcasing admin-selected videos.
- 🧱 **Content Carousels**:
  - 🔴 **Live Now**: Currently streaming based on schedule.
  - 🔥 **Featured**: Promoted videos.
  - 📅 **Upcoming**: Videos yet to go live.
- 🔍 **Functional Search**: Full-page overlay to search by title.
- 📚 **My Library**: Personalized saved content section.
- 🎥 **Immersive Video Player**: Full-screen player for selected content.
- 📄 **Static Pages**: Styled FAQ, Terms of Use, and Privacy Policy pages.

---

### 🛠 Admin Panel

- 🧭 **Professional Layout**: Fully responsive with persistent sidebar.
- 📊 **Real-Data Analytics**:
  - Total users & videos
  - 📈 Line chart (last 7 days new users)
  - 🥧 Doughnut chart (user roles)
  - Simulated "Active Now" & "Watch Time"
- 👥 **User Management**:
  - Create, view, update roles, delete users
- 🎞 **Content Management**:
  - Upload/edit videos & thumbnails via modal
  - **Advanced Scheduling**: `Live From` / `Live Until`
  - **Section Tagging**: Hero, Live Now, Featured, Upcoming

---

## 📁 Folder Structure

/streamsync
├── client/ # React Frontend
│ ├── public/
│ │ └── logo.png
│ └── src/
│ ├── api/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── App.js
│ └── index.js
│
└── server/ # Node.js Backend
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/ # Stores uploaded videos & thumbnails
└── server.js

yaml
Copy
Edit

---

## 🧪 Prerequisites

Ensure the following are installed:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## ⚙️ Local Development Setup

### 1. Backend Setup

```bash
# Navigate to the backend
cd server

# Install dependencies
npm install
Create a .env file in the server/ directory:

env
Copy
Edit
PORT=5000
MONGO_URI=mongodb://localhost:27017/streamsync
JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random
GLOBAL_START_TIME=2025-01-01T00:00:00Z
2. Frontend Setup
bash
Copy
Edit
# Navigate to the frontend
cd ../client

# Install dependencies
npm install
Create a .env file in the client/ directory:

env
Copy
Edit
REACT_APP_API_URL=http://localhost:5000/api
3. Add Logo
Place your logo at:

arduino
Copy
Edit
client/public/logo.png
🏃 Running the Application
Terminal 1: Start Backend
bash
Copy
Edit
cd server
nodemon server.js
Expected output:

arduino
Copy
Edit
Server is running...
MongoDB Connected...
Terminal 2: Start Frontend
bash
Copy
Edit
cd client
npm start
App launches at: http://localhost:3000

🧪 Try It Out
Register a new user.

Promote the user to admin via MongoDB.

Log in as admin and start managing videos.

Schedule content and assign to dashboard sections.

Experience real-time global sync streaming!

📌 Notes
All scheduling is based on the universal GLOBAL_START_TIME.

This app simulates live syncing — it does not implement true real-time video sync (e.g., via WebRTC).

📃 License
MIT © 2025 StreamSync Contributors

🙌 Contributing
Pull requests are welcome. Please follow conventional commit standards and keep code clean.

💬 Support
For issues or suggestions, open a GitHub issue or contact the maintainer.

yaml
Copy
Edit

---

Let me know if you want a downloadable `.md` file, GitHub-specific optimizations (like badges or shie
