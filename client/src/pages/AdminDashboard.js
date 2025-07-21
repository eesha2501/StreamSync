// client/src/pages/AdminDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../AdminDashboardV2.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// Main Component
const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('dashboard');
    const [data, setData] = useState({ analytics: null, users: [], videos: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVideo, setEditingVideo] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, usersRes, videosRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/users'),
                api.get('/admin/videos')
            ]);
            setData({
                analytics: analyticsRes.data,
                users: usersRes.data,
                videos: videosRes.data
            });
        } catch (err) {
            setError('Failed to fetch admin data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAddModal = () => setEditingVideo({});
    const openEditModal = (video) => setEditingVideo(video);
    const closeModal = () => setEditingVideo(null);

    const renderView = () => {
        switch (view) {
            case 'users':
                return <UserManagement users={data.users} refreshData={fetchData} />;
            case 'content':
                return <ContentManagement videos={data.videos} refreshData={fetchData} onEdit={openEditModal} />;
            case 'dashboard':
            default:
                return <DashboardView analytics={data.analytics} users={data.users} />;
        }
    };

    return (
        <div className="admin-layout-flex">
            <Sidebar setView={setView} currentView={view} />
            <div className="admin-main-content">
                <Header user={user} onAddContent={openAddModal} />
                <main className="content-area">
                    {loading ? <p>Loading...</p> : error ? <p style={{color: 'red'}}>{error}</p> : renderView()}
                </main>
            </div>
            {editingVideo && <ContentModal closeModal={closeModal} refreshData={fetchData} video={editingVideo} />}
        </div>
    );
};

// --- Child Components ---

const Sidebar = ({ setView, currentView }) => (
    <aside className="sidebar">
        <div className="sidebar-header"><h1 className="sidebar-brand-text">STREAM SYNC</h1></div>
        <nav className="sidebar-nav">
            <button onClick={() => setView('dashboard')} className={`sidebar-link ${currentView === 'dashboard' ? 'active' : ''}`}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h18V3H3.75zM9.75 9.75h4.5m-4.5 4.5h4.5m-7.5 4.5h10.5" /></svg>
                <span>Dashboard</span>
            </button>
            <button onClick={() => setView('users')} className={`sidebar-link ${currentView === 'users' ? 'active' : ''}`}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.308M15 19.128v-3.872M15 19.128l-3.262-3.262M9 5.25v3.872m0 0l3.262 3.262M9 5.25a3.375 3.375 0 016.75 0" /></svg>
                <span>Users</span>
            </button>
            <button onClick={() => setView('content')} className={`sidebar-link ${currentView === 'content' ? 'active' : ''}`}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5M4.5 5.25l7.5 7.5 7.5-7.5" /></svg>
                <span>Content</span>
            </button>
        </nav>
    </aside>
);

const Header = ({ user, onAddContent }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleLogout = () => { logout(); navigate('/'); };
    
    return (
        <header className="main-header">
            <h2 className="main-header-title">Admin Dashboard</h2>
            <div className="header-actions">
                <Link to="/dashboard" className="add-content-btn" style={{backgroundColor: '#4f46e5', textDecoration: 'none'}}>View Site</Link>
                <button onClick={onAddContent} className="add-content-btn">+ Add Content</button>
                <div className="admin-profile" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <img src={`https://placehold.co/40x40/ffffff/111111?text=${user?.name?.charAt(0).toUpperCase()}`} alt="Admin Avatar" />
                    <div className="admin-profile-info"><p className="name">{user?.name}</p><p className="role">{user?.role}</p></div>
                    <div className={`profile-dropdown ${!isDropdownOpen ? 'hidden' : ''}`}><button onClick={handleLogout}>Logout</button></div>
                </div>
            </div>
        </header>
    );
};

const DashboardView = ({ analytics, users }) => {
    const processRegistrationData = () => {
        if (!analytics || !analytics.dailyRegistrations) return { labels: [], datasets: [] };
        const labels = [];
        const data = [];
        const dateMap = new Map(analytics.dailyRegistrations.map(item => [item._id, item.count]));
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(dateMap.get(dateString) || 0);
        }
        return {
            labels,
            datasets: [{
                label: 'New Users', data, borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4, fill: true
            }]
        };
    };
    
    const userChartData = processRegistrationData();
    const roleChartData = {
        labels: analytics?.userRoles.map(r => r.role) || [],
        datasets: [{
            data: analytics?.userRoles.map(r => r.count) || [],
            backgroundColor: ['#8B5CF6', '#a855f7', '#7e22ce'],
        }]
    };

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card"><p className="label">Total Users</p><p className="value">{analytics?.totalUsers.toLocaleString()}</p></div>
                <div className="stat-card"><p className="label">Active Now (Simulated)</p><p className="value">{analytics?.activeUsers.toLocaleString()}</p></div>
                <div className="stat-card"><p className="label">Total Videos</p><p className="value">{analytics?.totalVideos.toLocaleString()}</p></div>
                <div className="stat-card"><p className="label">Total Watch Time (min)</p><p className="value">{analytics?.totalWatchTimeMinutes.toLocaleString()}</p></div>
            </div>
            <div className="charts-grid">
                <div className="chart-container-wrapper">
                    <h3>New User Registrations (Last 7 Days)</h3>
                    <Line data={userChartData} options={{ responsive: true, scales: { y: { beginAtZero: true, grid: { color: '#2c2c34' } }, x: { grid: { color: '#2c2c34' } } }, plugins: { legend: { display: false } } }} />
                </div>
                <div className="chart-container-wrapper">
                    <h3>Users by Role</h3>
                    <Doughnut data={roleChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
            </div>
            <div className="table-container">
                <h3 className="table-title">Recently Joined Users</h3>
                <div className="table-wrapper">
                    <table>
                        <thead className="table-header"><tr><th>User</th><th>Email</th><th>Join Date</th><th>Role</th></tr></thead>
                        <tbody>
                            {users.slice(0, 5).map(u => (
                                <tr key={u._id} className="table-row">
                                    <td className="table-user-cell"><img src={`https://placehold.co/32x32/8B5CF6/ffffff?text=${u.name.charAt(0).toUpperCase()}`} alt="avatar" />{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const UserManagement = ({ users, refreshData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', { name, email, password, role });
            alert('User created successfully!');
            setName(''); setEmail(''); setPassword(''); setRole('user');
            refreshData();
        } catch (err) { alert(err.response?.data?.message || 'Failed to create user.'); }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await api.put(`/admin/users/${userId}`, { role: newRole });
                alert('User role updated successfully!');
                refreshData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to update user role.');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                alert('User deleted successfully.');
                refreshData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user.');
            }
        }
    };

    return (
        <>
            <div className="table-container">
                <h3 className="table-title">Add New User</h3>
                <form onSubmit={handleCreateUser} className="add-user-form">
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <select value={role} onChange={e => setRole(e.target.value)}>
                        <option value="user">User</option><option value="admin">Admin</option>
                    </select>
                    <button type="submit">Add User</button>
                </form>
            </div>
            <div className="table-container">
                <h3 className="table-title">Manage All Users</h3>
                <div className="table-wrapper">
                    <table>
                        <thead className="table-header"><tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} className="table-row">
                                    <td className="table-user-cell"><img src={`https://placehold.co/32x32/8B5CF6/ffffff?text=${u.name.charAt(0).toUpperCase()}`} alt="avatar" />{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select defaultValue={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="role-select">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="table-actions">
                                        <button onClick={() => handleDeleteUser(u._id)} className="table-action-btn delete-btn" title="Delete User">
                                            <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4.888c-.081.01-.16.023-.238.038a41.15 41.15 0 00-.238-.038h.476zM12.5 3.75a.75.75 0 00-1.5 0v.443c.54.05.986.11 1.412.188a.75.75 0 00.088-1.484A41.54 41.54 0 0012.5 3.75zM7.5 3.75a.75.75 0 00-1.412.188A41.54 41.54 0 006 4.193a.75.75 0 00.088 1.484c.426-.078.872-.138 1.412-.188V3.75z" clipRule="evenodd"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const ContentManagement = ({ videos, refreshData, onEdit }) => {
    const handleDeleteVideo = async (videoId) => {
        if (window.confirm('Are you sure you want to permanently delete this video?')) {
            try {
                await api.delete(`/admin/videos/${videoId}`);
                alert('Video deleted successfully.');
                refreshData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete video.');
            }
        }
    };

    return (
        <div className="table-container">
            <h3 className="table-title">Manage All Content</h3>
            <div className="table-wrapper">
                <table>
                    <thead className="table-header"><tr><th>Title</th><th>Status</th><th>Live From</th><th>Live Until</th><th>Actions</th></tr></thead>
                    <tbody>
                        {videos.map(v => (
                            <tr key={v._id} className="table-row">
                                <td>{v.title}</td>
                                <td><span className={`status-badge status-${v.status}`}>{v.status}</span></td>
                                <td>{new Date(v.publishAt).toLocaleString()}</td>
                                <td>{v.liveEndTime ? new Date(v.liveEndTime).toLocaleString() : 'Always Live'}</td>
                                <td className="table-actions">
                                    <button onClick={() => onEdit(v)} className="table-action-btn" title="Edit Video"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"></path></svg></button>
                                    <button onClick={() => handleDeleteVideo(v._id)} className="table-action-btn delete-btn" title="Delete Video"><svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4.888c-.081.01-.16.023-.238.038a41.15 41.15 0 00-.238-.038h.476zM12.5 3.75a.75.75 0 00-1.5 0v.443c.54.05.986.11 1.412.188a.75.75 0 00.088-1.484A41.54 41.54 0 0012.5 3.75zM7.5 3.75a.75.75 0 00-1.412.188A41.54 41.54 0 006 4.193a.75.75 0 00.088 1.484c.426-.078.872-.138 1.412-.188V3.75z" clipRule="evenodd"></path></svg></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ContentModal = ({ closeModal, refreshData, video }) => {
    const isEditMode = video && video._id;
    const [formData, setFormData] = useState({
        title: video.title || '',
        description: video.description || '',
        duration: video.duration || '',
        publishAt: video.publishAt ? new Date(video.publishAt).toISOString().slice(0, 16) : '',
        liveEndTime: video.liveEndTime ? new Date(video.liveEndTime).toISOString().slice(0, 16) : '',
        sections: video.sections || []
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSectionChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({ ...prev, sections: checked ? [...prev.sections, value] : prev.sections.filter(s => s !== value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if(formData[key]) data.append(key, formData[key])
        });
        if (videoFile) data.append('video', videoFile);
        if (thumbnailFile) data.append('thumbnail', thumbnailFile);
        data.set('sections', JSON.stringify(formData.sections));

        try {
            if (isEditMode) {
                await api.put(`/admin/videos/${video._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Content updated successfully!');
            } else {
                await api.post('/admin/videos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Content added successfully!');
            }
            refreshData();
            closeModal();
        } catch (err) { alert(err.response?.data?.message || 'Failed to save content.'); }
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="modal-title">{isEditMode ? 'Edit Content' : 'Add New Content'}</h2><button onClick={closeModal} className="modal-close-btn">&times;</button></div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group"><label>Title</label><input name="title" type="text" value={formData.title} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange}></textarea></div>
                    <div className="form-group"><label>Duration (seconds)</label><input name="duration" type="number" value={formData.duration} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Video File</label><input type="file" onChange={(e) => setVideoFile(e.target.files[0])} required={!isEditMode} /></div>
                    <div className="form-group"><label>Thumbnail Image</label><input type="file" onChange={(e) => setThumbnailFile(e.target.files[0])} required={!isEditMode} /></div>
                    <div className="form-group"><label>Live From (Publish Date)</label><input name="publishAt" type="datetime-local" value={formData.publishAt} onChange={handleChange} /></div>
                    <div className="form-group"><label>Live End Time (optional)</label><input name="liveEndTime" type="datetime-local" value={formData.liveEndTime} onChange={handleChange} /></div>
                    <div className="form-group">
                        <label>Display in Sections</label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" value="hero" checked={formData.sections.includes('hero')} onChange={handleSectionChange} /> Hero Carousel</label>
                            <label><input type="checkbox" value="featured" checked={formData.sections.includes('featured')} onChange={handleSectionChange} /> Featured</label>
                            <label><input type="checkbox" value="live" checked={formData.sections.includes('live')} onChange={handleSectionChange} /> Live Now</label>
                            <label><input type="checkbox" value="upcoming" checked={formData.sections.includes('upcoming')} onChange={handleSectionChange} /> Upcoming</label>
                        </div>
                    </div>
                    <button type="submit">{isEditMode ? 'Save Changes' : 'Add Content'}</button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
