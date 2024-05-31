import React, { useState, useEffect } from 'react';
import { get, ref, set } from '../services/firebase';
import { auth } from '../services/firebase';
import { getDatabase } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import '../styles/app_style.css';


const database = getDatabase();

const DashboardPage = () => {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApiKey = async () => {
            const user = auth.currentUser;
            if (user) {
                const userSnapshot = await get(ref(database, 'users/' + user.uid));
                const userData = userSnapshot.val();
                setApiKey(userData.apiKey || '');
                setLoading(false);
            }
        };
        fetchApiKey();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (user) {
            await set(ref(database, 'users/' + user.uid + '/apiKey'), apiKey);
            alert('API key saved successfully!');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>Dashboard</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Gemini API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        /><br />
                        <button onClick={handleSave}>Save API Key</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
