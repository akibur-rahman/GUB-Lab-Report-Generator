// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { login } from '../services/authService';

const LoginPage = ({ history }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        try {
            await login(email, password);
            history.push('/app');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Login</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br />
            <button onClick={handleLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div>{error}</div>}
            <div>
                Not a user? <button onClick={() => history.push('/signup')}>Sign UP</button>
            </div>
        </div>
    );
};

export default LoginPage;
