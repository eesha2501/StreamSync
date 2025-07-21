// client/src/pages/PrivacyPolicyPage.js
import React from 'react';
import { Link } from 'react-router-dom';

// All the styles for this page are included directly in the component.
const PrivacyPolicyStyles = () => (
  <style>{`
    .privacy-page-body {
        font-family: 'Inter', sans-serif;
        background-color: #0f0f12;
        color: #e5e7eb;
        min-height: 100vh;
    }
    .privacy-container {
        width: 100%;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
    .privacy-header {
        padding: 1rem 0;
        border-bottom: 1px solid #2c2c34;
    }
    .privacy-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .privacy-header-brand {
        font-size: 1.875rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #8B5CF6;
        text-decoration: none;
    }
    .privacy-back-button {
        background-color: #1a1a1f;
        border: 1px solid #2c2c34;
        color: white;
        font-weight: 600;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    .privacy-back-button:hover {
        background-color: #2c2c34;
    }
    .privacy-main-content {
        padding-top: 4rem;
        padding-bottom: 4rem;
    }
    .privacy-page-title {
        font-size: 3rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 3rem;
    }
    .privacy-content {
        color: #d1d5db;
        line-height: 1.7;
    }
    .privacy-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #2c2c34;
        padding-bottom: 0.5rem;
    }
    .privacy-content p {
        margin-bottom: 1rem;
    }
    .privacy-content ul {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }
    .privacy-content li {
        margin-bottom: 0.5rem;
    }
    @media (max-width: 768px) {
        .privacy-page-title {
            font-size: 2.25rem;
        }
    }
  `}</style>
);

const PrivacyPolicyPage = () => {
    return (
        <>
            <PrivacyPolicyStyles />
            <div className="privacy-page-body">
                <header className="privacy-header">
                    <div className="privacy-container privacy-header-content">
                        <Link to="/" className="privacy-header-brand">STREAMSYNC</Link>
                        <Link to="/" className="privacy-back-button">Home</Link>
                    </div>
                </header>

                <main className="privacy-main-content">
                    <div className="privacy-container">
                        <h1 className="privacy-page-title">Privacy Policy</h1>
                        <div className="privacy-content">
                            <p>Last updated: July 21, 2025</p>
                            <p>Stream Sync ("us", "we", or "our") operates the Stream Sync website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
                            
                            <h2>1. Information Collection and Use</h2>
                            <p>We collect several different types of information for various purposes to provide and improve our Service to you. While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
                            <ul>
                                <li>Email address</li>
                                <li>First name and last name</li>
                                <li>Cookies and Usage Data</li>
                            </ul>

                            <h2>2. Use of Data</h2>
                            <p>Stream Sync uses the collected data for various purposes:</p>
                            <ul>
                                <li>To provide and maintain the Service</li>
                                <li>To notify you about changes to our Service</li>
                                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                                <li>To provide customer care and support</li>
                                <li>To provide analysis or valuable information so that we can improve the Service</li>
                                <li>To monitor the usage of the Service</li>
                                <li>To detect, prevent and address technical issues</li>
                            </ul>

                            <h2>3. Security of Data</h2>
                            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

                            <h2>4. Service Providers</h2>
                            <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

                            <h2>5. Links to Other Sites</h2>
                            <p>Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
                            
                            <h2>6. Changes to This Privacy Policy</h2>
                            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default PrivacyPolicyPage;
