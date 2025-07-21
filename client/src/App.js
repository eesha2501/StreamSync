// client/src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VideoPlayerPage from './pages/VideoPlayer';
import FaqPage from './pages/FaqPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Import all necessary CSS files
import './App.css';
import './LandingPage.css';
import './AuthModal.css';
import './DashboardV2.css';
import './AdminDashboardV2.css';
import './VideoPlayer.css';


// --- Route Protection Components ---
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="loading-screen">Loading...</div>;
    return user ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="loading-screen">Loading...</div>;
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Private User Routes */}
        <Route
          path="/dashboard"
          element={ <PrivateRoute><UserDashboard /></PrivateRoute> }
        />
        <Route 
          path="/video/:id" 
          element={ <PrivateRoute><VideoPlayerPage /></PrivateRoute> } 
        />

        {/* Private Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Catch-all route to redirect unknown paths to the landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
