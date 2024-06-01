import React, { useState, useEffect } from 'react';
import { generateAiResponse } from '../services/chatService';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import promptsData from '../models/prompts.json';
import { get, ref } from 'firebase/database';
import { auth, database } from '../services/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Loading screen component
const LoadingScreen = () => {
    return (
        <div style={styles.overlay}>
            <div style={styles.spinner}></div>
        </div>
    );
};



// ApplicationPage component
const ApplicationPage = () => {
    const [formData, setFormData] = useState({});
    const [responses, setResponses] = useState({});
    const [editMode, setEditMode] = useState({});
    const [userData, setUserData] = useState(() => {
        const storedUserData = localStorage.getItem('userData');
        return storedUserData ? JSON.parse(storedUserData) : {
            apiKey: '',
            firstName: '',
            lastName: '',
            userId: '',
        };
    });
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isInitiated, setIsInitiated] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
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
                        const parsedUserData = {
                            userId: user.uid,
                            apiKey: userData.apiKey || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                        };
                        setUserData(parsedUserData);
                        localStorage.setItem('userData', JSON.stringify(parsedUserData));
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

    // Handle generate function
    const handleGenerate = async (key) => {
        try {
            setLoading(true); // Set loading to true when fetching response
            if (key === "Title Of The Lab Experiment") {
                if (!formData[key].trim()) {
                    alert('Please enter a title for the lab experiment.');
                    setLoading(false); // Set loading to false if validation fails
                    return;
                }
                const prompt = `${promptsData[key]} ${formData[key]}`;
                const response = await generateAiResponse(userData.apiKey, prompt, conversationHistory);
                setResponses(prev => ({ ...prev, [key]: response }));
                setFormData(prev => ({ ...prev, [key]: response }));
                setConversationHistory(prevHistory => [...prevHistory, { sender: 'Human', text: prompt }, { sender: 'AI', text: response }]);
            } else {
                if (!responses["Title Of The Lab Experiment"]) {
                    alert('Please generate the title first.');
                    setLoading(false); // Set loading to false if title is not generated
                    return;
                }
                const prompt = promptsData[key];
                const response = await generateAiResponse(userData.apiKey, prompt, conversationHistory);
                setResponses(prev => ({ ...prev, [key]: response }));
                setFormData(prev => ({ ...prev, [key]: response }));
                setConversationHistory(prevHistory => [...prevHistory, { sender: 'Human', text: prompt }, { sender: 'AI', text: response }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Set loading to false after response is fetched or if there's an error
        }
    };

    const handleInitiate = async () => {
        try {
            const systemPrompt = promptsData.System;
            const response = await generateAiResponse(userData.apiKey, systemPrompt, conversationHistory);
            setIsInitiated(true);
            setConversationHistory(prevHistory => [...prevHistory, { sender: 'Human', text: systemPrompt }, { sender: 'AI', text: response }]);
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
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const generatePDF = () => {
        const fullResponse = Object.values(responses).join('\n\n');
        console.log(fullResponse);
    };

    const handleTextareaChange = (e, key) => {
        setFormData({ ...formData, [key]: e.target.value });
        setEditMode({ ...editMode, [key]: true });
        adjustTextareaHeight(e.target);
    };

    const adjustTextareaHeight = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustTextareaHeight);
    }, [formData]);

    return (
        <div style={styles.container}>
            {/* Conditionally render LoadingScreen */}
            {loading && <LoadingScreen />}
            <div style={styles.header}>
                <div>
                    <p>Profile Banner</p>
                    <p>User ID: {userData.userId || 'Loading...'}</p>
                    <p>Name: {userData.firstName} {userData.lastName}</p>
                </div>
                <div style={styles.headerRight}>
                    <p style={{ textAlign: 'center' }}>API Key: {userData.apiKey || 'Loading...'}</p>
                    <button style={styles.button} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={styles.button} onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <h1 style={styles.heading}>Lab Report Generator</h1>
            {!isInitiated && (
                <div style={styles.centeredButtonContainer}>
                    <button style={styles.button} onClick={handleInitiate}>
                        Initiate
                    </button>
                </div>
            )}
            {isInitiated && (
                <>
                    <div style={styles.section}>
                        <h2>Title of the Lab Experiment</h2>
                        <textarea
                            value={formData["Title Of The Lab Experiment"]}
                            onChange={(e) => handleTextareaChange(e, "Title Of The Lab Experiment")}
                            style={styles.inputField}
                            placeholder="Enter the title of the lab experiment"
                        />
                        <div style={styles.centeredButtonContainer}>
                            <button style={styles.button} onClick={() => handleGenerate("Title Of The Lab Experiment")} disabled={!formData["Title Of The Lab Experiment"].trim()}>
                                {responses["Title Of The Lab Experiment"] ? 'Regenerate' : 'Generate'}
                            </button>
                            {editMode["Title Of The Lab Experiment"] && (
                                <button style={styles.button} onClick={() => handleSave("Title Of The Lab Experiment")}>Save</button>
                            )}
                        </div>
                        {responses["Title Of The Lab Experiment"] && (
                            <div style={styles.responseContainer}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {responses["Title Of The Lab Experiment"]}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                    {Object.keys(promptsData).filter(key => key !== "Title Of The Lab Experiment" && key !== "System").map(key => (
                        <div key={key} style={styles.section}>
                            <h2>{key.toUpperCase()}</h2>
                            <textarea
                                value={formData[key]}
                                onChange={(e) => handleTextareaChange(e, key)}
                                style={styles.textarea}
                            />
                            <div style={styles.centeredButtonContainer}>
                                <button style={styles.button} onClick={() => handleGenerate(key)} disabled={!responses["Title Of The Lab Experiment"]}>
                                    {responses[key] ? 'Regenerate' : 'Generate'}
                                </button>
                                {editMode[key] && (
                                    <button style={styles.button} onClick={() => handleSave(key)}>Save</button>
                                )}
                            </div>
                            {responses[key] && (
                                <div style={styles.responseContainer}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {responses[key]}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={styles.centeredButtonContainer}>
                        <button style={styles.button} onClick={generatePDF}>Generate PDF</button>
                    </div>
                </>
            )}
        </div>


    );
};

const styles = {
    container: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '20px',
    },
    headerRight: {
        textAlign: 'center',
    },
    heading: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    inputField: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '15px',
    },
    button: {
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007BFF',
        color: 'white',
        cursor: 'pointer',
        marginRight: '10px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        resize: 'none',
        overflow: 'hidden',
    },
    responseContainer: {
        border: '1px solid #ccc',
        padding: '10px',
        marginTop: '10px',
    },
    section: {
        width: '100%',
        marginBottom: '20px',
    },
    centeredButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
    },
    // Loading screen styles
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensures loading screen appears above other content
    },
    spinner: {
        border: '6px solid rgba(255, 255, 255, 0.3)', // Semi-transparent white border
        borderTop: '6px solid #fff', // White border for spinner
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite', // Spin animation
    },
    '@keyframes spin': {
        '0%': {
            transform: 'rotate(0deg)',
        },
        '100%': {
            transform: 'rotate(360deg)',
        },
    },
};


export default ApplicationPage;

