const { GoogleGenerativeAI } = require("@google/generative-ai");

const gemini_api_key = "AIzaSyD3zJ_ihXbUbwOmFEmAy0x8PKMeiGokl4Y";
const googleAI = new GoogleGenerativeAI(gemini_api_key);

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
});

const generate = async () => {
    try {
        const prompt = "Hello, Are you there?";
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        console.log(response.text());
    } catch (error) {
        console.log("response error", error);
    }
};

generate();