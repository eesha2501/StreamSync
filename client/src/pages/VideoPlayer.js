// client/src/pages/VideoPlayerPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../VideoPlayer.css';

const VideoPlayerPage = () => {
    const { id } = useParams();
    const [videoData, setVideoData] = useState(null);
    const [upNext, setUpNext] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    const apiBaseUrl = process.env.REACT_APP_API_URL.replace('/api', '');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/users/videos/${id}`);
                setVideoData(data.video);
                
                // Find the next video in the user's sequence
                const currentIndex = data.sequence.findIndex(v => v._id === data.video._id);
                if (currentIndex !== -1 && currentIndex < data.sequence.length - 1) {
                    setUpNext(data.sequence.slice(currentIndex + 1));
                } else {
                    setUpNext([]);
                }

            } catch (err) {
                setError('Could not load video data.');
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    useEffect(() => {
        // This effect handles the actual video playback once data is loaded
        if (videoData && videoRef.current) {
            const videoElement = videoRef.current;
            videoElement.src = `${apiBaseUrl}${videoData.url}`;
            videoElement.play().catch(e => console.error("Autoplay was prevented.", e));
        }
    }, [videoData, apiBaseUrl]);


    if (loading) return <div className="player-page-body" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading Player...</div>;
    if (error) return <div className="player-page-body" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{error}</div>;
    if (!videoData) return null;

    return (
        <div className="player-page-body">
            <header className="player-header">
                <div className="dashboard-container header-content">
                    <Link to="/dashboard" className="header-brand brand-text">STREAM SYNC</Link>
                    <Link to="/dashboard" className="hero-button secondary" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                        <svg style={{height: '1.25rem', width: '1.25rem'}} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main>
                <section className="video-player-wrapper">
                    <video ref={videoRef} className="video-element" muted controls />
                    {/* We are using default controls for now, custom controls can be added here */}
                </section>

                <section className="dashboard-container details-section">
                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem'}}>
                        <div>
                            <h1 style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{videoData.title}</h1>
                            <p style={{marginTop: '1rem', fontSize: '1.1rem', color: '#d1d5db'}}>{videoData.description}</p>
                        </div>
                        <div>
                            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Up Next</h3>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {upNext.slice(0, 3).map(video => (
                                    <Link to={`/video/${video._id}`} key={video._id} className="live-card" style={{flexDirection: 'row', alignItems: 'center', gap: '1rem', padding: '0.5rem', textDecoration: 'none', color: 'white'}}>
                                        <img src={`https://placehold.co/160x90/1c1c1c/fff?text=${encodeURIComponent(video.title)}`} style={{width: '120px', height: 'auto', borderRadius: '4px'}} alt={video.title}/>
                                        <div>
                                            <h4 style={{fontWeight: 600}}>{video.title}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VideoPlayerPage;

