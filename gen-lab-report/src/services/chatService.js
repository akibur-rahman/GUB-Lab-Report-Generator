// src/services/chatService.js
import google from 'google.generativeai';
import { get, ref } from './firebase';

export const getGeminiResponse = async (userId, promptKey, additionalInfo = '') => {
    const userSnapshot = await get(ref(database, 'users/' + userId));
    const user = userSnapshot.val();
    const apiKey = user.apiKey;

    google.generativeai.configure({ apiKey });

    const model = google.generativeai.GenerativeModel('gemini-pro');
    const chat = model.start_chat({ history: [] });

    const prompt = require('../models/prompts.json')[promptKey];
    const response = await chat.send_message(`${prompt} ${additionalInfo}`);
    return response.text;
};
