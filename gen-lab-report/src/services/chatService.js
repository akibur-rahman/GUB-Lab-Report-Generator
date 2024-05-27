// chatService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateAiResponse(apiKey, prompt) {
    const gemini_api_key = apiKey;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);

    const geminiModel = googleAI.getGenerativeModel({
        model: "gemini-pro",
    });

    try {
        const request = prompt;
        const result = await geminiModel.generateContent(request);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.log("response error", error);
        throw error;
    }
}

module.exports = { generateAiResponse };
