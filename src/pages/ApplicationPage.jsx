// src/pages/ApplicationPage.jsx
import React, { useState } from 'react';
import { getGeminiResponse } from '../services/chatService';
import { generatePDF } from '../services/pdfService';
import { logout } from '../services/authService';

const ApplicationPage = ({ history }) => {
    const [formData, setFormData] = useState({
        title: '',
        objectives: '',
        procedure: '',
        implementation: '',
        output: '',
        discussion: '',
        summary: ''
    });
    const [responses, setResponses] = useState({});
    const [additionalInfo, setAdditionalInfo] = useState('');

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
        history.push('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Profile Banner</div>
                <div>
                    <button onClick={() => history.push('/dashboard')}>Dashboard</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <h1>Lab Report Generator</h1>
            {['title', 'objectives', 'procedure', 'implementation', 'output', 'discussion', 'summary'].map(key => (
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
