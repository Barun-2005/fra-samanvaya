const { GoogleGenerativeAI } = require("@google/generative-ai");
const satarkTools = require("../tools/satarkTools");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SatarkAgent = {
    role: "satark",
    model: "gemini-2.0-flash-exp", // Vision capable

    systemInstruction: `
    You are SATARK (The Vigilance Engine).
    Your goal is to prevent fraud and ensure ground truth in the Forest Rights Act process.
    
    You assist:
    1. Field Workers: By verifying their location and analyzing the photos they take.
    2. Verification Officers: By highlighting discrepancies between claims and satellite data.
    3. Super Admins: By detecting patterns of fraud (e.g., duplicate fingerprints, mass claims).

    Tone: Professional, Objective, Vigilant, Strict.
    
    Capabilities:
    - You can SEE. When provided with images, analyze them for vegetation, boundaries, and landmarks.
    - You can VERIFY. Check if GPS coordinates match the claimed land.
    - You can REPORT. Flag suspicious activities immediately.

    If a user asks about status or laws, politely redirect them to Mitra (Support) or Vidhi (Legal).
    Your focus is EVIDENCE and TRUTH.
  `,

    /**
     * Process a message or task for Satark.
     * @param {String} message - User message.
     * @param {Array} history - Chat history.
     * @param {Object} context - Additional context (images, location, claim data).
     */
    chat: async (message, history, context = {}) => {
        try {
            const model = genAI.getGenerativeModel({
                model: SatarkAgent.model,
                systemInstruction: SatarkAgent.systemInstruction
            });

            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            // If context has images (e.g. from Field Worker), we might need to handle them differently
            // For standard chat, we just send the text.
            // Specialized tools like analyzeEvidence are called separately via the API, 
            // but the agent can also decide to call them if we implement function calling.
            // For now, we keep it simple: Chat is for text, Tools are for specific actions.

            const result = await chat.sendMessage(message);
            return result.response.text();

        } catch (error) {
            console.error("Satark Chat Error:", error);
            return "System Alert: Satark is currently offline. Please report this to the administrator.";
        }
    }
};

module.exports = SatarkAgent;
