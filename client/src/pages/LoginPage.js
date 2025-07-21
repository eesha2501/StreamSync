    // client/src/pages/LoginPage.js
    import React, { useState, useContext } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { AuthContext } from '../context/AuthContext';

    // Added a prop to handle switching to the register view
    const LoginPage = ({ onSwitchToRegister }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const { login } = useContext(AuthContext);
        const navigate = useNavigate();

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            try {
                const userData = await login(email, password);
                if (userData && userData.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed.');
            }
        };

        return (
            // Using a React Fragment <> because the parent modal provides the container
            <>
                <h1 style={{color: 'white', textAlign: 'center', marginBottom: '1.5rem'}}>Login</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="Email Address" required />
                    </div>
                    <div className="form-group">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Password" required />
                    </div>
                    <button type="submit" className="form-button">Sign In</button>
                </form>
                <div className="form-switcher">
                    New here? <span onClick={onSwitchToRegister} className="form-switcher-link">Register now</span>
                </div>
            </>
        );
    };

    export default LoginPage;
    