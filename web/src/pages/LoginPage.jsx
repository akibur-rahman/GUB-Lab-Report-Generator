import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import '../styles/styles.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password, navigate);
        } catch (error) {
            console.error('Login failed:', error.message);
        }
    };

    const handleSignupClick = () => {

    };

    return (
        <div className="container">
            <h1 className="heading">Login</h1>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="input-field"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="input-field"
                        required
                    />
                </div>
                <button type="submit" className="button">Login</button>
            </form>
            <div className="link">
                Don't have an account? <span onClick={() => navigate('/signup')}><a>Sign Up</a></span>
            </div>
        </div >
    );
};

export default LoginPage;
