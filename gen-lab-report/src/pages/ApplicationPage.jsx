import React, { useState, useEffect } from 'react';
import { getGeminiResponse } from '../services/chatService';
import { generatePDF } from '../services/pdfService';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import promptsData from '../models/prompts.json'; // Import prompts data
import { get, ref } from 'firebase/database';
import { auth, database } from '../services/firebase'; // Assuming you have Firebase service imported

const ApplicationPage = () => {
    const [formData, setFormData] = useState({});
    const [responses, setResponses] = useState({});
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [userData, setUserData] = useState({
        apiKey: '',
        firstName: '',
        lastName: '',
        userId: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize formData with prompts from promptsData
        const initialFormData = {};
        for (const key in promptsData) {
            initialFormData[key] = '';
        }
        setFormData(initialFormData);

        // Fetch the user's data when the component mounts
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
    });

    const handleGenerate = async (key) => {
        try {
            const response = await getGeminiResponse('USER_ID', key, additionalInfo);
            setResponses(prev => ({ ...prev, [key]: response }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = (key) => {
        setFormData(prev => ({ ...prev, [key]: responses[key] }));
    };

    const handleGeneratePDF = () => {
        generatePDF(formData);
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
            {Object.keys(formData).map(key => (
                <div key={key} style={{ margin: '20px 0' }}>
                    <h2>{key.toUpperCase()}</h2>
                    <textarea
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        style={{ width: '100%', height: '100px' }}
                    />
                    <div>
                        <button onClick={() => handleGenerate(key)}>
                            {responses[key] ? 'Regenerate' : 'Generate'}
                        </button>
                        {responses[key] && <button onClick={() => handleSave(key)}>Save</button>}
                    </div>
                    {responses[key] && (
                        <div
                            style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px', cursor: 'pointer' }}
                            onDoubleClick={() => setFormData({ ...formData, [key]: responses[key] })}
                        >
                            {responses[key]}
                        </div>
                    )}
                </div>
            ))}
            <button onClick={handleGeneratePDF}>Generate PDF</button>
        </div>
    );
};

export default ApplicationPage;
