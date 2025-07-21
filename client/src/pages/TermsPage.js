// client/src/pages/TermsPage.js
import React from 'react';
import { Link } from 'react-router-dom';

// All the styles for this page are included directly in the component.
const TermsPageStyles = () => (
  <style>{`
    .terms-page-body {
        font-family: 'Inter', sans-serif;
        background-color: #0f0f12;
        color: #e5e7eb;
        min-height: 100vh;
    }
    .terms-container {
        width: 100%;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
    .terms-header {
        padding: 1rem 0;
        border-bottom: 1px solid #2c2c34;
    }
    .terms-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .terms-header-brand {
        font-size: 1.875rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #8B5CF6;
        text-decoration: none;
    }
    .terms-back-button {
        background-color: #1a1a1f;
        border: 1px solid #2c2c34;
        color: white;
        font-weight: 600;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    .terms-back-button:hover {
        background-color: #2c2c34;
    }
    .terms-main-content {
        padding-top: 4rem;
        padding-bottom: 4rem;
    }
    .terms-page-title {
        font-size: 3rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 3rem;
    }
    .terms-content {
        color: #d1d5db;
        line-height: 1.7;
    }
    .terms-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #2c2c34;
        padding-bottom: 0.5rem;
    }
    .terms-content p {
        margin-bottom: 1rem;
    }
    .terms-content ul {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }
    .terms-content li {
        margin-bottom: 0.5rem;
    }
    @media (max-width: 768px) {
        .terms-page-title {
            font-size: 2.25rem;
        }
    }
  `}</style>
);

const TermsPage = () => {
    return (
        <>
            <TermsPageStyles />
            <div className="terms-page-body">
                <header className="terms-header">
                    <div className="terms-container terms-header-content">
                        <Link to="/" className="terms-header-brand">STREAMSYNC</Link>
                        <Link to="/" className="terms-back-button">Home</Link>
                    </div>
                </header>

                <main className="terms-main-content">
                    <div className="terms-container">
                        <h1 className="terms-page-title">Terms of Use</h1>
                        <div className="terms-content">
                            <p>Last updated: July 21, 2025</p>
                            <p>Please read these Terms of Use ("Terms", "Terms of Use") carefully before using the Stream Sync website (the "Service") operated by Stream Sync ("us", "we", or "our").</p>
                            
                            <h2>1. Acceptance of Terms</h2>
                            <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>

                            <h2>2. Accounts</h2>
                            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

                            <h2>3. Content</h2>
                            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
                            <p>By uploading content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>

                            <h2>4. Termination</h2>
                            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                            <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>

                            <h2>5. Limitation Of Liability</h2>
                            <p>In no event shall Stream Sync, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                            <h2>6. Changes</h2>
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default TermsPage;
