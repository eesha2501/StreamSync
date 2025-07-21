// client/src/components/AuthModal.js
import React, { useState } from 'react';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import '../AuthModal.css';

const AuthModal = ({ onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    const switchToRegister = () => setIsLoginView(false);
    const switchToLogin = () => setIsLoginView(true);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                {isLoginView ? (
                    <LoginPage onSwitchToRegister={switchToRegister} />
                ) : (
                    <RegisterPage onSwitchToLogin={switchToLogin} />
                )}
            </div>
        </div>
    );
};

export default AuthModal;
