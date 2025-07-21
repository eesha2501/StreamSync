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

\`\`\`bash
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
    ├── uploads/    # Stores uploaded videos & thumbnails
    └── server.js
\`\`\`

---

## 🧪 Prerequisites

Make sure the following are installed:

- Node.js (v14 or higher)  
- npm (comes with Node.js)  
- MongoDB (local or MongoDB Atlas)  

---

## ⚙️ Local Development Setup

### 1. Backend Setup

\`\`\`bash
# Navigate to the backend
cd server

# Install dependencies
npm install
\`\`\`

Create a `.env` file in the `server/` directory and add:

\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/streamsync
JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random
GLOBAL_START_TIME=2025-01-01T00:00:00Z
\`\`\`

---

### 2. Frontend Setup

\`\`\`bash
# Navigate to the frontend
cd ../client

# Install dependencies
npm install
\`\`\`

Create a `.env` file in the `client/` directory and add:

\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

---

### 3. Add Logo

Place your logo here:

\`\`\`bash
client/public/logo.png
\`\`\`

---

## 🏃 Running the Application

### Terminal 1: Start Backend

\`\`\`bash
cd server
nodemon server.js
\`\`\`

Expected output:

\`\`\`bash
Server is running...
MongoDB Connected...
\`\`\`

---

### Terminal 2: Start Frontend

\`\`\`bash
cd client
npm start
\`\`\`

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Try It Out

1. Register a new user  
2. Promote the user to admin manually via MongoDB  
3. Log in as admin and start adding videos  
4. Schedule content and assign it to dashboard sections  
5. Experience simulated real-time global sync streaming  

---

## 📌 Notes

- All times are based on the `GLOBAL_START_TIME`
- This is a simulated live sync system. Real-time WebRTC-style synchronization is **not** implemented

---

## 📃 License

MIT © 2025 StreamSync Contributors

---

## 🙌 Contributing

Pull requests are welcome. Please use conventional commits and write clean, testable code.

---

## 💬 Support

For bugs, feedback, or contributions, open a GitHub issue or contact the maintainer.
