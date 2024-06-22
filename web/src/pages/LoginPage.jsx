import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password, navigate);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Login</h1>
            <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.formGroup}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        style={styles.inputField}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        style={styles.inputField}
                        required
                    />
                </div>
                <button type="submit" style={styles.button}>Login</button>
            </form>
            <div style={styles.link}>
                Don't have an account? <button style={styles.signupText} onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    heading: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    form: {
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
    },
    formGroup: {
        marginBottom: '15px',
    },
    inputField: {
        width: '300px',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '15px',
    },
    button: {
        width: '320px',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: 'none',
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        cursor: 'pointer',
    },
    link: {
        marginTop: '20px',
        fontSize: '1rem',
    },
    signupText: {
        color: '#007BFF',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: '0',
        fontSize: '1rem',
    },
};

export default LoginPage;
