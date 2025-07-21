// client/src/pages/FaqPage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// All the styles for this page are now included directly in the component.
const FaqPageStyles = () => (
  <style>{`
    .faq-page-body {
        font-family: 'Inter', sans-serif;
        background-color: #0f0f12;
        color: #e5e7eb;
        min-height: 100vh;
    }
    .faq-container {
        width: 100%;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
    .faq-header {
        padding: 1rem 0;
        border-bottom: 1px solid #2c2c34;
    }
    .faq-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .faq-header-brand {
        font-size: 1.875rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #8B5CF6;
        text-decoration: none;
    }
    .faq-back-button {
        background-color: #1a1a1f;
        border: 1px solid #2c2c34;
        color: white;
        font-weight: 600;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    .faq-back-button:hover {
        background-color: #2c2c34;
    }
    .faq-main-content {
        padding-top: 4rem;
        padding-bottom: 4rem;
    }
    .faq-page-title {
        font-size: 3rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 3rem;
    }
    .faq-accordion {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .faq-item {
        background-color: #1a1a1f;
        border: 1px solid #2c2c34;
        border-radius: 0.5rem;
        overflow: hidden;
    }
    .faq-question {
        width: 100%;
        background: none;
        border: none;
        padding: 1.5rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        text-align: left;
    }
    .faq-question:hover {
        background-color: #2c2c34;
    }
    .faq-icon {
        font-size: 1.5rem;
        transition: transform 0.3s ease-in-out;
    }
    .faq-question.active .faq-icon {
        transform: rotate(45deg);
    }
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
        padding: 0 1.5rem;
        color: #d1d5db;
        line-height: 1.6;
    }
    .faq-answer p {
        margin: 0;
        padding-bottom: 1.5rem;
    }
    @media (max-width: 768px) {
        .faq-page-title {
            font-size: 2.25rem;
        }
        .faq-question {
            font-size: 1.1rem;
        }
    }
  `}</style>
);

const FaqPage = () => {
    useEffect(() => {
        const faqQuestions = document.querySelectorAll('.faq-question');

        const handleClick = (event) => {
            const button = event.currentTarget;
            const answer = button.nextElementSibling;
            
            button.classList.toggle('active');

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.style.padding = "0 1.5rem";
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.style.padding = "0 1.5rem 1.5rem 1.5rem";
            } 
        };

        faqQuestions.forEach(button => {
            button.addEventListener('click', handleClick);
        });

        return () => {
            faqQuestions.forEach(button => {
                button.removeEventListener('click', handleClick);
            });
        };
    }, []);

    return (
        <>
            <FaqPageStyles />
            <div className="faq-page-body">
                <header className="faq-header">
                    <div className="faq-container faq-header-content">
                        <Link to="/" className="faq-header-brand">STREAMSYNC</Link>
                        <Link to="/" className="faq-back-button">Home</Link>
                    </div>
                </header>

                <main className="faq-main-content">
                    <div className="faq-container">
                        <h1 className="faq-page-title">Frequently Asked Questions</h1>

                        <div className="faq-accordion">
                            <div className="faq-item">
                                <button className="faq-question">
                                    <span>What is Stream Sync?</span>
                                    <span className="faq-icon">+</span>
                                </button>
                                <div className="faq-answer">
                                    <p>Stream Sync is a unique streaming platform where your personal video playlist is synchronized to a universal global clock. This means whenever you tune in, you're watching your content at the exact same point in its timeline as everyone else is in theirs, creating a shared, live-like experience.</p>
                                </div>
                            </div>

                            <div className="faq-item">
                                <button className="faq-question">
                                    <span>How does the synchronization work?</span>
                                    <span className="faq-icon">+</span>
                                </button>
                                <div className="faq-answer">
                                    <p>We use a fixed global start time (e.g., 00:00 UTC on a specific date). When you log in, our server calculates the total time that has passed since that start time and determines the exact video and the precise second of playback you should be seeing from the global video sequence. This calculation is the same for everyone, ensuring perfect synchronization.</p>
                                </div>
                            </div>

                            <div className="faq-item">
                                <button className="faq-question">
                                    <span>Can I rewind or fast-forward?</span>
                                    <span className="faq-icon">+</span>
                                </button>
                                <div className="faq-answer">
                                    <p>No. The core concept of Stream Sync is to create a "live" broadcast experience. Just like a live TV channel, you cannot rewind or fast-forward. You simply "tune in" to the stream as it is happening globally.</p>
                                </div>
                            </div>

                            <div className="faq-item">
                                <button className="faq-question">
                                    <span>How is my video sequence determined?</span>
                                    <span className="faq-icon">+</span>
                                </button>
                                <div className="faq-answer">
                                    <p>The platform operates on a single global sequence of all available published videos, sorted by their creation date. This ensures that every user, whether they registered today or a year ago, has access to the same continuous stream of content.</p>
                                </div>
                            </div>

                            <div className="faq-item">
                                <button className="faq-question">
                                    <span>What happens when a video ends?</span>
                                    <span className="faq-icon">+</span>
                                </button>
                                <div className="faq-answer">
                                    <p>When a video finishes, the next video in the global sequence will automatically begin playing. If you reach the end of the entire sequence, it will loop back to the beginning, ensuring there is always content playing 24/7.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default FaqPage;
