# 📺 StreamSync: A Full-Stack Synchronized Streaming Platform

**StreamSync** is a MERN stack web application that simulates synchronized, Netflix-style streaming across users with a global universal timer. It includes a polished user-facing frontend and an advanced admin panel to manage users, content, and analytics.

---

## 🧰 Tech Stack

- **Frontend**: React, Axios, Chart.js, React Router DOM  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB with Mongoose  
- **Authentication**: JWT (JSON Web Tokens)  
- **File Uploads**: Multer

---

## 🧑‍💻 Features

### User Panel

- 🎬 Hero Banner (Live Countdown)
- 🔐 Login/Register Popup UI
- 🎞 Netflix-style Sections: Live Now, Featured, Upcoming
- 🔍 Search Page
- 📚 My Library
- 🎥 Watch Video Page
- 📄 Static Pages: FAQ, Terms of Use, Privacy Policy

### Admin Panel

- 📊 Dashboard with Line & Pie Charts
- 👥 User Management (Add, Delete, Role Change)
- 🎬 Video Management:
  - Upload Video + Thumbnail
  - Set "Live From", "Live Until"
  - Assign to Sections (Hero, Live, Featured, Upcoming)

---

## 📁 Folder Structure

```bash
/streamsync
├── client/                   # React frontend
│   ├── public/
│   │   └── logo.png
│   └── src/
│       ├── api/              # Axios API utilities
│       ├── components/       # Reusable components
│       ├── context/          # Auth context
│       ├── pages/            # Page-level components
│       ├── App.js
│       └── index.js
│
└── server/                   # Node.js backend
    ├── config/               # DB and ENV setup
    ├── controllers/          # Business logic
    ├── middleware/           # Auth & upload middleware
    ├── models/               # Mongoose schemas
    ├── routes/               # Express routes
    ├── uploads/              # Video/Thumbnail storage
    ├── .env
    └── server.js
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/streamsync
JWT_SECRET=supersecurejwtsecretkey
GLOBAL_START_TIME=2025-01-01T00:00:00Z
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/streamsync.git
cd streamsync
```

---

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

---

### 3. Start Development Server

#### Terminal 1: Backend

```bash
cd server
nodemon server.js
```

#### Terminal 2: Frontend

```bash
cd client
npm start
```

App runs on: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing the App

1. Register a user via UI
2. Promote user to admin manually in MongoDB
3. Login as admin
4. Upload videos, assign sections, set timing
5. Verify sync in real time via multiple tabs/devices

---

## 💡 Key Sync Concept

All video section visibility is based on the `GLOBAL_START_TIME`.  
Each content's `liveFrom` and `liveUntil` time is **relative** to that baseline.  
This enables "Live Now" style content regardless of user join time.

---

## 🧾 License

MIT License © 2025

---

## 🙌 Contributing

Pull requests and feedback are welcome!  
Open issues or contact the maintainer via email or GitHub.

---



