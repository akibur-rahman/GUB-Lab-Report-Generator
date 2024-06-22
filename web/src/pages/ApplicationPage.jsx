import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Typography, Paper, TextField, Button, Box, AppBar, Toolbar, Avatar, Checkbox, FormControlLabel, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { generateAiResponse } from '../services/chatService';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import promptsData from '../models/prompts.json';
import { get, ref } from 'firebase/database';
import { auth, database } from '../services/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generatePDF as generatePDFService } from '../services/pdfService';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;


const SpinnerDiv = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;


const LoadingScreen = () => {
    return (
        <div style={styles.overlay}>
            <SpinnerDiv />
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
    const [loading, setLoading] = useState(false);
    const [additionalContexts, setAdditionalContexts] = useState({});
    const [showAdditionalContexts, setShowAdditionalContexts] = useState({});
    const textAreaRefs = useRef({});
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [pdfFormData, setPdfFormData] = useState({
        departmentName: '',
        semester: '',
        labReportNo: '',
        courseTitle: '',
        courseCode: '',
        section: '',
        labExperimentName: '',
        studentName: '',
        studentId: '',
        labDate: '',
        submissionDate: '',
        courseTeacherName: ''
    });


    useEffect(() => {
        const initialFormData = {};
        const initialEditMode = {};
        const initialAdditionalContexts = {};
        const initialShowAdditionalContexts = {};
        for (const key in promptsData) {
            initialFormData[key] = '';
            initialEditMode[key] = false;
            initialAdditionalContexts[key] = '';
            initialShowAdditionalContexts[key] = false;
        }
        setFormData(initialFormData);
        setEditMode(initialEditMode);
        setAdditionalContexts(initialAdditionalContexts);
        setShowAdditionalContexts(initialShowAdditionalContexts);

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
                        alert('User data not found');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    alert('Error fetching user data');
                }
            } else {
                console.warn('User is not authenticated');
                //alert('User is not authenticated');
            }
        };
        fetchUserData();
    }, []);

    const handleGenerate = async (key) => {
        try {
            setLoading(true);
            const prompt = `${promptsData[key]} ${formData[key]}`;
            const additionalContextFormatting = ". Additional context: ";
            const finalPrompt = showAdditionalContexts[key] && additionalContexts[key].trim()
                ? `${prompt}${additionalContextFormatting}${additionalContexts[key]}`
                : prompt;
            const response = await generateAiResponse(userData.apiKey, finalPrompt, conversationHistory);
            setResponses(prev => ({ ...prev, [key]: response }));
            setFormData(prev => ({ ...prev, [key]: response }));
            setConversationHistory(prevHistory => [...prevHistory, { sender: 'Human', text: finalPrompt }, { sender: 'AI', text: response }]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async () => {
        try {
            setLoading(true);
            const systemPrompt = promptsData.System;
            const response = await generateAiResponse(userData.apiKey, systemPrompt, conversationHistory);
            setIsInitiated(true);
            setConversationHistory(prevHistory => [...prevHistory, { sender: 'Human', text: systemPrompt }, { sender: 'AI', text: response }]);
        } catch (error) {
            console.error(error);
            alert('Error initiating!!! Check your API Key in the dashboard. If you are using the app for the first time, Plese add the API Key in the dashboard.');
        } finally {
            setLoading(false);
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

    const handleGeneratePDF = () => {
        setOpen(true);
    };

    const handlePdfFormChange = (e) => {
        const { name, value } = e.target;
        setPdfFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDownloadPDF = () => {
        setOpen(false);
        const formattedResponses = Object.keys(promptsData).reduce((acc, key) => {
            if (responses[key]) {
                acc[key] = {
                    response: responses[key],
                    originalFormatting: formData[key],
                };
            }
            return acc;
        }, {});

        generatePDFService(formattedResponses, pdfFormData);
    };

    const handleTextareaChange = (e, key) => {
        const value = e.target.value;
        setFormData({ ...formData, [key]: value });
        setEditMode({ ...editMode, [key]: true });

        adjustTextareaHeight(key);
    };

    const adjustTextareaHeight = (key) => {
        const textarea = textAreaRefs.current[key];
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    return (
        <Box>
            {loading && <LoadingScreen />}
            <AppBar position="static" style={styles.appBar}>
                <Toolbar>
                    <Box display="flex" alignItems="center" flexGrow={1}>
                        <Avatar alt="User" src="https://cdn.dribbble.com/users/1632728/screenshots/4693038/profilepic_dribbble.gif" style={styles.avatar} />
                        <Typography variant="h6" style={styles.userName}>
                            {userData.firstName} {userData.lastName}
                        </Typography>
                    </Box>
                    <Button variant="contained" style={styles.button} onClick={() => navigate('/dashboard')}>Dashboard</Button>
                    <Button variant="contained" style={styles.button} onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">

                {!isInitiated && (

                    <Box display="flex" justifyContent="center" paddingTop='350px' mt={4}>
                        <Button variant="contained" style={styles.gradientButton} onClick={handleInitiate}>
                            Create a New Lab Report
                        </Button>
                    </Box>

                )}
                {isInitiated && (
                    <>
                        {Object.keys(promptsData).filter(key => key !== "System").map(key => (
                            <Paper key={key} elevation={3} style={styles.section}>
                                <Typography variant="h5">{key.toUpperCase()}</Typography>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    value={formData[key]}
                                    onChange={(e) => handleTextareaChange(e, key)}
                                    multiline
                                    minRows={3}
                                    maxRows={10}
                                    inputRef={el => textAreaRefs.current[key] = el}
                                    style={styles.inputField}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={showAdditionalContexts[key]}
                                            onChange={() => setShowAdditionalContexts(prev => ({ ...prev, [key]: !prev[key] }))}
                                        />
                                    }
                                    label="Add additional context"
                                />
                                {showAdditionalContexts[key] && (
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        value={additionalContexts[key]}
                                        onChange={(e) => setAdditionalContexts(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder="Enter additional context"
                                        multiline
                                        rows={4}
                                        style={styles.inputField}
                                    />
                                )}
                                <Box display="flex" justifyContent="center" mt={2}>
                                    <Button variant="contained" style={styles.gradientButton} onClick={() => handleGenerate(key)}>
                                        {responses[key] ? 'Regenerate' : 'Generate'}
                                    </Button>
                                    {editMode[key] && (
                                        <Button variant="contained" style={styles.gradientButtonSecondary} onClick={() => handleSave(key)} styles={{ marginLeft: '10px' }}>
                                            Save
                                        </Button>
                                    )}
                                </Box>
                                {responses[key] && (
                                    <Paper elevation={1} style={styles.responseContainer}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {responses[key]}
                                        </ReactMarkdown>
                                    </Paper>
                                )}
                            </Paper>
                        ))}
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Button variant="contained" style={styles.GenegratePDFgradientButton} onClick={handleGeneratePDF}>
                                Generate PDF
                            </Button>
                        </Box>
                    </>
                )}
            </Container>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle align='center'>Enter Cover Page Details</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="departmentName"
                        label="Department Name"
                        fullWidth
                        value={pdfFormData.departmentName}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="semester"
                        label="Semester"
                        fullWidth
                        value={pdfFormData.semester}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="labReportNo"
                        label="Lab Report No"
                        fullWidth
                        value={pdfFormData.labReportNo}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="courseTitle"
                        label="Course Title"
                        fullWidth
                        value={pdfFormData.courseTitle}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="courseCode"
                        label="Course Code"
                        fullWidth
                        value={pdfFormData.courseCode}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="section"
                        label="Section"
                        fullWidth
                        value={pdfFormData.section}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="labExperimentName"
                        label="Lab Experiment Name"
                        fullWidth
                        value={pdfFormData.labExperimentName}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="studentName"
                        label="Student Name"
                        fullWidth
                        value={pdfFormData.studentName}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="studentId"
                        label="Student ID"
                        fullWidth
                        value={pdfFormData.studentId}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="labDate"
                        label="Lab Date"
                        fullWidth
                        value={pdfFormData.labDate}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="submissionDate"
                        label="Submission Date"
                        fullWidth
                        value={pdfFormData.submissionDate}
                        onChange={handlePdfFormChange}
                    />
                    <TextField
                        margin="dense"
                        name="courseTeacherName"
                        label="Course Teacher Name"
                        fullWidth
                        value={pdfFormData.courseTeacherName}
                        onChange={handlePdfFormChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button style={styles.gradientButton} onClick={handleDownloadPDF} color="primary">
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>


    );
};

const styles = {
    appBar: {
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        marginBottom: '20px',
        width: '100%',
        borderRadius: '10px',
    },
    avatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginRight: '10px',
    },
    userName: {
        fontWeight: 'bold',
        fontFamily: 'cursive',
    },
    button: {
        marginLeft: '10px',
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        fontWeight: 'bold',
    },
    gradientButton: {
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        fontWeight: 'bold',
    },
    gradientButtonSecondary: {
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: '10px',
    },
    GenegratePDFgradientButton: {
        background: 'linear-gradient(to right, #4A90E2, #9013FE)',
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: '10px',
        marginBottom: '100px',
        marginTop: '30px',
        paddingLeft: '100px',
        paddingRight: '100px',
    },
    heading: {
        marginBottom: '20px',
    },
    inputField: {
        marginBottom: '15px',
    },
    section: {
        padding: '20px',
        marginBottom: '20px',
    },
    responseContainer: {
        padding: '10px',
        marginTop: '10px',
    },

    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTop: '4px solid #fff',
        width: '40px',
        height: '40px',
        animation: `${spin} 1s linear infinite`,
    },
};

export default ApplicationPage;