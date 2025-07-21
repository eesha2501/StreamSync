// client/src/pages/UserDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../DashboardV2.css';

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [playbackData, setPlaybackData] = useState(null);
    const [heroVideos, setHeroVideos] = useState([]);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [view, setView] = useState('home'); // 'home' or 'library'
    const [library, setLibrary] = useState([]); // State for user's library
    const navigate = useNavigate();
    const apiBaseUrl = process.env.REACT_APP_API_URL.replace('/api', '');

    useEffect(() => {
        const fetchSequence = async () => {
            try {
                const { data } = await api.get('/users/sequence');
                setPlaybackData(data);
                setHeroVideos(data.heroVideos || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not fetch your stream.');
            } finally {
                setLoading(false);
            }
        };
        fetchSequence();
    }, []);

    useEffect(() => {
        if (heroVideos.length > 1) {
            const timer = setInterval(() => {
                setCurrentHeroIndex(prevIndex => (prevIndex + 1) % heroVideos.length);
            }, 7000);
            return () => clearInterval(timer);
        }
    }, [heroVideos]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm) {
                try {
                    const { data } = await api.get(`/users/search?q=${searchTerm}`);
                    setSearchResults(data);
                } catch (searchError) {
                    console.error("Search failed:", searchError);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const scrollRow = (rowId, direction) => {
        const row = document.querySelector(`.content-row[data-row-id='${rowId}']`);
        if (row) {
            const container = row.querySelector('.carousel-container');
            const scrollAmount = container.clientWidth;
            container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };

    const handleAddToLibrary = (e, videoToAdd) => {
        e.preventDefault();
        e.stopPropagation();
        setLibrary(prevLibrary => {
            if (prevLibrary.find(v => v._id === videoToAdd._id)) {
                alert(`${videoToAdd.title} is already in your library.`);
                return prevLibrary;
            }
            alert(`${videoToAdd.title} added to library!`);
            return [...prevLibrary, videoToAdd];
        });
    };

    const handlePlayFromCard = (e, videoToPlay) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/video/${videoToPlay._id}`);
    };

    if (loading) {
        return <div className="dashboard-v2-body"><div style={{margin: 'auto', color: 'white'}}>Loading...</div></div>;
    }

    if (error || !playbackData || !playbackData.sequence || playbackData.sequence.length === 0) {
        return <div className="dashboard-v2-body"><div style={{margin: 'auto', color: 'white'}}>{error || playbackData?.message || "Stream starting soon..."}</div></div>;
    }

    const nowPlaying = playbackData.sequence[playbackData.nowPlayingIndex];
    const featuredVideos = playbackData.sequence.filter(v => v.sections.includes('featured'));
    const liveNowVideos = playbackData.sequence.filter(v => v.sections.includes('live'));
    const upcomingVideos = playbackData.sequence.filter(v => {
        const now = new Date();
        return v.sections.includes('upcoming') && new Date(v.publishAt) > now;
    });
    
    const currentHeroVideo = heroVideos.length > 0 ? heroVideos[currentHeroIndex] : nowPlaying;

    const renderContent = () => {
        if (isSearchOpen) {
            return (
                <div className="content-section" style={{marginTop: '5rem'}}>
                    <section className="content-row" data-row-id="search">
                        <h2 className="content-row-title">Search Results for "{searchTerm}"</h2>
                        <div className="library-grid">
                            {searchResults.length > 0 ? searchResults.map(video => (
                                <Link to={`/video/${video._id}`} key={video._id} className="content-card">
                                    <img className="card-thumbnail" src={`${apiBaseUrl}${video.thumbnail}`} alt={video.title} />
                                    <div className="card-info-overlay"><h3 className="card-info-title">{video.title}</h3></div>
                                    <div className="card-actions"><button className="card-action-btn" onClick={(e) => handleAddToLibrary(e, video)} title="Add to Library">+</button></div>
                                </Link>
                            )) : <p>No results found.</p>}
                        </div>
                    </section>
                </div>
            );
        }

        if (view === 'library') {
            return (
                <div className="content-section" style={{marginTop: '5rem'}}>
                    <section className="content-row">
                        <h2 className="content-row-title">My Library</h2>
                        <div className="library-grid">
                            {library.length > 0 ? library.map(video => (
                                <Link to={`/video/${video._id}`} key={video._id} className="content-card">
                                    <img className="card-thumbnail" src={`${apiBaseUrl}${video.thumbnail}`} alt={video.title} />
                                    <div className="card-info-overlay"><h3 className="card-info-title">{video.title}</h3></div>
                                </Link>
                            )) : <p>Your library is empty. Click the '+' on a video to add it.</p>}
                        </div>
                    </section>
                </div>
            );
        }

        return (
            <>
                <section className="hero-banner" style={{backgroundImage: `url(${apiBaseUrl}${currentHeroVideo.thumbnail})`}}>
                    <div className="hero-vignette"></div>
                    <div className="hero-content">
                        <h1 className="hero-title">{currentHeroVideo.title}</h1>
                        <p className="hero-description">{currentHeroVideo.description}</p>
                        <div className="hero-buttons">
                            <Link to={`/video/${currentHeroVideo._id}`} className="hero-button primary">
                                <svg style={{height: '1.5rem', width: '1.5rem'}} fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                                <span>Play</span>
                            </Link>
                            <button className="hero-button secondary">
                                <svg style={{height: '1.5rem', width: '1.5rem'}} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7.5-1.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
                                <span>More Info</span>
                            </button>
                        </div>
                    </div>
                    <div className="hero-dots">
                        {heroVideos.map((video, index) => (
                            <span
                                key={video._id}
                                className={`hero-dot ${index === currentHeroIndex ? 'active' : ''}`}
                                onClick={() => setCurrentHeroIndex(index)}
                            ></span>
                        ))}
                    </div>
                </section>

                <div className="content-section">
                    <section id="live-now-section" className="content-row" data-row-id="0">
                        <h2 className="content-row-title">Live Now</h2>
                        <div className="carousel-container">
                            {liveNowVideos.map(video => (
                                <div key={video._id} className="content-card" onClick={(e) => handlePlayFromCard(e, video)}>
                                    <img className="card-thumbnail" src={`${apiBaseUrl}${video.thumbnail}`} alt={video.title} />
                                    <div className="card-info-overlay"><h3 className="card-info-title">{video.title}</h3><p className="card-info-desc">{video.description}</p></div>
                                    <div className="card-actions"><button className="card-action-btn" onClick={(e) => handlePlayFromCard(e, video)} title="Play">▶</button><button className="card-action-btn" onClick={(e) => handleAddToLibrary(e, video)} title="Add to Library">+</button></div>
                                </div>
                            ))}
                        </div>
                        <button className="scroll-btn left" onClick={() => scrollRow(0, 'left')}>‹</button>
                        <button className="scroll-btn right" onClick={() => scrollRow(0, 'right')}>›</button>
                    </section>

                    <section className="content-row" data-row-id="1">
                        <h2 className="content-row-title">Featured</h2>
                        <div className="carousel-container">
                            {featuredVideos.map(video => (
                                <div key={video._id} className="content-card" onClick={(e) => handlePlayFromCard(e, video)}>
                                    <img className="card-thumbnail" src={`${apiBaseUrl}${video.thumbnail}`} alt={video.title} />
                                    <div className="card-info-overlay"><h3 className="card-info-title">{video.title}</h3><p className="card-info-desc">{video.description}</p></div>
                                    <div className="card-actions"><button className="card-action-btn" onClick={(e) => handlePlayFromCard(e, video)} title="Play">▶</button><button className="card-action-btn" onClick={(e) => handleAddToLibrary(e, video)} title="Add to Library">+</button></div>
                                </div>
                            ))}
                        </div>
                        <button className="scroll-btn left" onClick={() => scrollRow(1, 'left')}>‹</button>
                        <button className="scroll-btn right" onClick={() => scrollRow(1, 'right')}>›</button>
                    </section>

                    <section className="content-row" data-row-id="2">
                        <h2 className="content-row-title">Upcoming</h2>
                        <div className="carousel-container">
                            {upcomingVideos.map(video => (
                                <div key={video._id} className="content-card" onClick={(e) => handlePlayFromCard(e, video)}>
                                    <img className="card-thumbnail" src={`${apiBaseUrl}${video.thumbnail}`} alt={video.title} />
                                    <div className="card-info-overlay"><h3 className="card-info-title">{video.title}</h3><p className="card-info-desc">{video.description}</p></div>
                                    <div className="card-actions"><button className="card-action-btn" onClick={(e) => handlePlayFromCard(e, video)} title="Play">▶</button><button className="card-action-btn" onClick={(e) => handleAddToLibrary(e, video)} title="Add to Library">+</button></div>
                                </div>
                            ))}
                        </div>
                        <button className="scroll-btn left" onClick={() => scrollRow(2, 'left')}>‹</button>
                        <button className="scroll-btn right" onClick={() => scrollRow(2, 'right')}>›</button>
                    </section>
                </div>
            </>
        );
    };

    return (
        <div className="dashboard-v2-body">
            <nav className="dashboard-sidebar">
                <Link to="/dashboard" onClick={() => { setView('home'); setIsSearchOpen(false); }}><img src="/logo.png" alt="Logo" className="sidebar-logo" /></Link>
                <div className="sidebar-nav">
                    <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="sidebar-link" title="Search">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <button onClick={() => { setView('home'); setIsSearchOpen(false); }} className="sidebar-link" title="Home">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M3 13.5V21.75a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V13.5m-18 0l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955" /></svg>
                    </button>
                    <button onClick={() => { setView('library'); setIsSearchOpen(false); }} className="sidebar-link" title="My Library">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                    </button>
                </div>
                <div className="sidebar-profile">
                    <button onClick={handleLogout} className="sidebar-link" title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    </button>
                    <img src={`https://placehold.co/50x50/8B5CF6/ffffff?text=${user?.name?.charAt(0).toUpperCase()}`} alt="User Avatar" className="sidebar-profile-img" />
                </div>
            </nav>

            {isSearchOpen && (
                <div className="search-overlay">
                    <input type="text" placeholder="Search for titles..." autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }} title="Close Search">&times;</button>
                </div>
            )}

            <div className="dashboard-main">
                <main>{renderContent()}</main>
                <footer className="footer">
                    <div className="footer-copyright">
                        &copy; 2025 Stream Sync. All Rights Reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default UserDashboard;
