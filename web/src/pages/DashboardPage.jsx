import React, { useState, useEffect } from 'react';
import { get, ref, set } from '../services/firebase';
import { auth } from '../services/firebase';
import { getDatabase } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress, Container, Typography, Box, Paper, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const database = getDatabase();

const DashboardPage = () => {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [showApiKey, setShowApiKey] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApiKey = async () => {
            const user = auth.currentUser;
            if (user) {
                const userSnapshot = await get(ref(database, 'users/' + user.uid));
                const userData = userSnapshot.val();
                setApiKey(userData?.apiKey || '');
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        // Set a listener to re-fetch the API key when the user changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchApiKey();
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            await set(ref(database, 'users/' + user.uid + '/apiKey'), apiKey);
            alert('API key saved successfully!');
        }
    };

    const handleToggleVisibility = () => {
        setShowApiKey((prev) => !prev);
    };

    return (
        <Container style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h3" gutterBottom>Dashboard</Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <TextField
                        label="Gemini API Key"
                        variant="outlined"
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ marginBottom: '20px', width: '300px' }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleToggleVisibility}>
                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    /><br />
                    <Button variant="contained" style={styles.button} onClick={handleSave}>
                        Save API Key
                    </Button>
                </>
            )}
            <Box mt={4}>
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Typography variant="h5">How to Fetch a Gemini API Key</Typography>
                    <ul>
                        <li>Log in to your <a href='https://ai.google.dev/aistudio'>Google AI Studio </a></li>
                        <li>Now login with your google account</li>
                        <li>Click On Get API Key</li>
                        <li>Generate a new API key.</li>
                        <li>Copy the API key and paste it in the above field.</li>
                    </ul>
                </Paper>
                <Paper elevation={3} style={{ padding: '20px' }}>
                    <Typography variant="h5">Tutorial Video</Typography>
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/wqjmHNcxyQw" // Placeholder video link
                        title="YouTube video player"

                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </Paper>
            </Box>
        </Container>
    );

};

const styles = {
    button: {
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: 'none',
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        cursor: 'pointer',
    },
};


export default DashboardPage;
