// client/src/pages/ContactPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios to send the data

// All the styles for this page are included directly in the component.
const ContactPageStyles = () => (
  <style>{`
    .contact-page-body {
        font-family: 'Inter', sans-serif;
        background-color: #0f0f12;
        color: #e5e7eb;
        min-height: 100vh;
    }
    .contact-container {
        width: 100%;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1.5rem;
        box-sizing: border-box;
    }
    .contact-header {
        padding: 1rem 0;
        border-bottom: 1px solid #2c2c34;
    }
    .contact-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .contact-header-brand {
        font-size: 1.875rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #8B5CF6;
        text-decoration: none;
    }
    .contact-back-button {
        background-color: #1a1a1f;
        border: 1px solid #2c2c34;
        color: white;
        font-weight: 600;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        text-decoration: none;
        transition: background-color 0.2s;
    }
    .contact-back-button:hover {
        background-color: #2c2c34;
    }
    .contact-main-content {
        padding-top: 4rem;
        padding-bottom: 4rem;
    }
    .contact-page-header {
        text-align: center;
        margin-bottom: 4rem;
    }
    .contact-page-title {
        font-size: 3.5rem;
        font-weight: 900;
        color: white;
    }
    .contact-page-subtitle {
        font-size: 1.25rem;
        color: #9ca3af;
        margin-top: 1rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    .contact-form-container {
        background-color: #1a1a1f;
        padding: 2.5rem;
        border-radius: 0.75rem;
        border: 1px solid #2c2c34;
        max-width: 768px; /* Set a max width for the form */
        margin: 0 auto; /* Center the form container */
    }
    .contact-form .form-group {
        margin-bottom: 1.5rem;
    }
    .contact-form label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #d1d5db;
    }
    .contact-form input,
    .contact-form textarea {
        width: 100%;
        box-sizing: border-box;
        background-color: #0f0f12;
        border: 1px solid #374151;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        transition: border-color 0.2s;
    }
    .contact-form input:focus,
    .contact-form textarea:focus {
        outline: none;
        border-color: #8B5CF6;
    }
    .contact-form textarea {
        min-height: 150px;
        resize: vertical;
    }
    .contact-submit-btn {
        width: 100%;
        padding: 0.8rem;
        border: none;
        border-radius: 0.375rem;
        background-image: linear-gradient(to right, #8B5CF6, #4F46E5);
        color: white;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: box-shadow 0.3s;
    }
    .contact-submit-btn:hover {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
    }
    .success-message {
        text-align: center;
        padding: 3rem 1rem;
    }
    .success-message h2 {
        font-size: 2rem;
        font-weight: bold;
        color: #8B5CF6;
    }
    .success-message p {
        font-size: 1.1rem;
        color: #d1d5db;
        margin-top: 1rem;
    }
    .error-message-form {
        color: #f87171;
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
        margin-bottom: 1.5rem;
    }

    /* --- NEW: Responsive Styles --- */
    @media (max-width: 768px) {
        .contact-page-title {
            font-size: 2.5rem;
        }
        .contact-page-subtitle {
            font-size: 1rem;
        }
        .contact-form-container {
            padding: 1.5rem;
        }
        .contact-container {
            padding: 0 1rem;
        }
    }
  `}</style>
);

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            // **IMPORTANT**: Replace this URL with your own from Formspree
            const formspreeEndpoint = 'https://formspree.io/f/manbqgwj'; 

            await axios.post(formspreeEndpoint, formData, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            setIsSubmitted(true); // Show the success message
        } catch (submissionError) {
            console.error("Form submission error:", submissionError);
            setError("Sorry, there was an error sending your message. Please try again later.");
        }
    };

    return (
        <>
            <ContactPageStyles />
            <div className="contact-page-body">
                <header className="contact-header">
                    <div className="contact-container contact-header-content">
                        <Link to="/" className="contact-header-brand">STREAMSYNC</Link>
                        <Link to="/" className="contact-back-button">Home</Link>
                    </div>
                </header>

                <main className="contact-main-content">
                    <div className="contact-container">
                        <div className="contact-page-header">
                            <h1 className="contact-page-title">Get In Touch</h1>
                            <p className="contact-page-subtitle">Have a question, a suggestion, or just want to say hello? We’d love to hear from you. Fill out the form below to reach out.</p>
                        </div>
                        
                        <div className="contact-form-container">
                            {isSubmitted ? (
                                <div className="success-message">
                                    <h2>Thank You!</h2>
                                    <p>Your message has been sent successfully. We'll get back to you shortly.</p>
                                </div>
                            ) : (
                                <form className="contact-form" onSubmit={handleSubmit}>
                                    {error && <div className="error-message-form">{error}</div>}
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Message</label>
                                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required></textarea>
                                    </div>
                                    <button type="submit" className="contact-submit-btn">Send Message</button>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ContactPage;
