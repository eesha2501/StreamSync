// client/src/pages/LandingPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import '../LandingPage.css';

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
  }, [isModalOpen]);

  useEffect(() => {
    const cards = document.querySelectorAll('.card');
    const onMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--y', `${(y / rect.height) * 100}%`);
    };
    cards.forEach(card => card.addEventListener('mousemove', onMouseMove));

    return () => {
      cards.forEach(card => card.removeEventListener('mousemove', onMouseMove));
    };
  }, []);

  return (
    <>
        <div className="landing-body">
        {/* Header */}
        <header className="landing-header">
            <div className="header-container header-content">
            <Link to="/" className="header-brand">
                <img src="/logo.png" alt="Stream Sync Logo" />
                <span>STREAMSYNC</span>
            </Link>
            <button onClick={() => setIsModalOpen(true)} className="header-login-btn">
                Login
            </button>
            </div>
        </header>

        {/* Main Content */}
        <main>
            {/* Hero Section */}
            <section className="hero-bg">
            <div className="landing-container">
                <h1 className="hero-title">
                Your Personal Stream, Synced with the World.
                </h1>
                <p className="hero-subtitle">
                Welcome to the global live reel. We align your personal video queue to a universal clock, so you can tune in anytime and be perfectly in sync with a worldwide community.
                </p>
                <div className="hero-cta-container">
                <button onClick={() => setIsModalOpen(true)} className="hero-cta-btn cta-pulse">
                    Start Your Stream
                </button>
                </div>
            </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
            <div className="landing-container">
                <div className="section-header">
                <h2 className="section-title">A New Way to Watch</h2>
                <p className="section-subtitle">Experience content like never before.</p>
                </div>
                <div className="features-grid">
                {/* Feature 1 */}
                <div className="card">
                    <div className="card-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                    </div>
                    <h3 className="card-title">1. Build Your Reel</h3>
                    <p className="card-description">Curate your perfect video playlist. This is your personal, continuous stream.</p>
                </div>
                {/* Feature 2 */}
                <div className="card">
                    <div className="card-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="card-title">2. Sync to the Clock</h3>
                    <p className="card-description">Your reel is mapped to a global 24/7 schedule, aligning you with every other user on the platform.</p>
                </div>
                {/* Feature 3 */}
                <div className="card">
                    <div className="card-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" /></svg>
                    </div>
                    <h3 className="card-title">3. Tune In Anytime</h3>
                    <p className="card-description">Drop in whenever you want. You'll instantly be watching your content, at the right time, every time.</p>
                </div>
                </div>
            </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
            <div className="landing-container">
                <div className="section-header">
                <h2 className="section-title">Join the Global Stream</h2>
                </div>
                <div className="testimonial-grid">
                <div className="card">
                    <p className="testimonial-text">"It's like having my own personal TV channel that's always on. I love knowing that while I'm watching my favorite documentary, thousands of others are synced up, watching their own thing. It feels so connected."</p>
                    <div className="testimonial-author">
                    <img src="https://placehold.co/48x48/ff8c1c/ffffff?text=A" alt="User Avatar" />
                    <div>
                        <h4 className="author-name">Anna K.</h4>
                        <p className="author-title">Global Streamer</p>
                    </div>
                    </div>
                </div>
                <div className="card">
                    <p className="testimonial-text">"I used to waste so much time deciding what to watch. Now, I just tune into my Stream Sync reel. It's my content, on a global schedule. Absolutely genius."</p>
                    <div className="testimonial-author">
                    <img src="https://placehold.co/48x48/1c90ff/ffffff?text=M" alt="User Avatar" />
                    <div>
                        <h4 className="author-name">Mike P.</h4>
                        <p className="author-title">Content Curator</p>
                    </div>
                    </div>
                </div>
                <div className="card">
                    <p className="testimonial-text">"The feeling of 'tuning in' is back! I can just open the site and I'm immediately watching something I've chosen, right on schedule. No more endless browsing."</p>
                    <div className="testimonial-author">
                    <img src="https://placehold.co/48x48/1cff5e/ffffff?text=S" alt="User Avatar" />
                    <div>
                        <h4 className="author-name">Samantha G.</h4>
                        <p className="author-title">Time-Sync Enthusiast</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </section>

            {/* CTA Section */}
            <section className="features-section">
            <div className="landing-container" style={{textAlign: 'center'}}>
                <h2 className="section-title" style={{maxWidth: '42rem', margin: '0 auto'}}>Ready to join the sync?</h2>
                <p className="section-subtitle" style={{marginTop: '1rem'}}>Enter your email to build your reel and start your stream.</p>
                <form style={{marginTop: '2rem', maxWidth: '40rem', margin: '2rem auto', display: 'flex', gap: '1rem'}}>
                <input type="email" placeholder="Enter your email" className="form-input" style={{flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)'}} required />
                <button type="submit" className="hero-cta-btn" style={{animation: 'none'}}>
                    Get Started
                </button>
                </form>
            </div>
            </section>
        </main>

        {/* --- MODIFIED Footer --- */}
        <footer className="footer">
            <div className="landing-container footer-content">
                <div className="footer-top-link">
                    <Link to="/contact">Questions? Contact us.</Link>
                </div>
                <ul className="footer-links-list">
                    <li><Link to="/faq">FAQ</Link></li>
                    <li><Link to="/privacy">Privacy Policy</Link></li>
                    <li><Link to="/terms">Terms of Use</Link></li>
                </ul>
                <div className="footer-bottom">
                    <p>&copy; 2025 Stream Sync. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
        </div>

        {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default LandingPage;
