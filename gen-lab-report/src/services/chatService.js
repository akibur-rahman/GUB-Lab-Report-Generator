// chatService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
let conversationHistory = []; // Initialize an empty conversation history

async function generateAiResponse(apiKey, prompt) {
    console.log(prompt);
    const gemini_api_key = apiKey;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiModel = googleAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const contextualPrompt = `${conversationHistory
            .map((message) => `${message.sender}: ${message.text}\n`)
            .join("")}Human: ${prompt}`;

        const request = contextualPrompt;
        const result = await geminiModel.generateContent(request);
        const response = result.response;

        // Add the new message to the conversation history
        conversationHistory.push({ sender: "AI", text: response.text() });

        return response.text();
    } catch (error) {
        console.log("response error", error);
        throw error;
    }
}

module.exports = { generateAiResponse };