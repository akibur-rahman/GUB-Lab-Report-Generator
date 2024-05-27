import React, { useState, useEffect } from 'react';
import { generateAiResponse } from '../services/chatService';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import promptsData from '../models/prompts.json';
import { get, ref } from 'firebase/database';
import { auth, database } from '../services/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ApplicationPage = () => {
    const [formData, setFormData] = useState({});
    const [responses, setResponses] = useState({});
    const [editMode, setEditMode] = useState({});
    const [userData, setUserData] = useState({
        apiKey: '',
        firstName: '',
        lastName: '',
        userId: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const initialFormData = {};
        const initialEditMode = {};
        for (const key in promptsData) {
            initialFormData[key] = '';
            initialEditMode[key] = false;
        }
        setFormData(initialFormData);
        setEditMode(initialEditMode);

        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userSnapshot = await get(ref(database, 'users/' + user.uid));
                    const userData = userSnapshot.val();
                    if (userData) {
                        setUserData({
                            userId: user.uid,
                            apiKey: userData.apiKey || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                        });
                    } else {
                        console.warn('User data not found for user:', user.uid);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                console.warn('User is not authenticated');
            }
        };
        fetchUserData();
    }, []);

    const handleGenerate = async (key) => {
        try {
            const prompt = promptsData[key];
            const response = await generateAiResponse(userData.apiKey, prompt);
            setResponses(prev => ({ ...prev, [key]: response }));
            setFormData(prev => ({ ...prev, [key]: response }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = (key) => {
        setResponses(prev => ({ ...prev, [key]: formData[key] }));
        setEditMode(prev => ({ ...prev, [key]: false }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <p>Profile Banner</p>
                    <p>User ID: {userData.userId || 'Loading...'}</p>
                    <p>Name: {userData.firstName} {userData.lastName}</p>
                </div>
                <div>
                    <p style={{ textAlign: 'center' }}>API Key: {userData.apiKey || 'Loading...'}</p>
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <h1>Lab Report Generator</h1>
            {Object.keys(promptsData).map(key => (
                <div key={key} style={{ margin: '20px 0' }}>
                    <h2>{key.toUpperCase()}</h2>
                    <textarea
                        value={formData[key]}
                        onChange={(e) => {
                            setFormData({ ...formData, [key]: e.target.value });
                            setEditMode({ ...editMode, [key]: true });
                        }}
                        style={{ width: '100%', height: '100px' }}
                    />
                    <div>
                        <button onClick={() => handleGenerate(key)}>
                            {responses[key] ? 'Regenerate' : 'Generate'}
                        </button>
                        {editMode[key] && (
                            <button onClick={() => handleSave(key)}>Save</button>
                        )}
                    </div>
                    {responses[key] && (
                        <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {responses[key]}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ApplicationPage;
