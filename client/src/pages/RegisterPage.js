    // client/src/pages/RegisterPage.js
    import React, { useState, useContext } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { AuthContext } from '../context/AuthContext';

    // Added a prop to handle switching to the login view
    const RegisterPage = ({ onSwitchToLogin }) => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const { register } = useContext(AuthContext);
        const navigate = useNavigate();

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            try {
                await register(name, email, password);
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || 'Registration failed.');
            }
        };

        return (
            <>
                <h1 style={{color: 'white', textAlign: 'center', marginBottom: '1.5rem'}}>Create Account</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="Name" required />
                    </div>
                    <div className="form-group">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="Email Address" required />
                    </div>
                    <div className="form-group">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Password" required />
                    </div>
                    <button type="submit" className="form-button">Register</button>
                </form>
                <div className="form-switcher">
                    Already have an account? <span onClick={onSwitchToLogin} className="form-switcher-link">Login</span>
                </div>
            </>
        );
    };

    export default RegisterPage;
    