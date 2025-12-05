const { GoogleGenerativeAI } = require("@google/generative-ai");
const vidhiTools = require("../tools/vidhiTools");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const VidhiAgent = {
    role: "vidhi",
    model: "gemini-2.5-pro", // High reasoning capability

    systemInstruction: `
    You are VIDHI (The Governance Engine).
    Your role is to act as a Legal Advisor and Judge for the Forest Rights Act (FRA) 2006.
    
    You assist:
    1. Verification Officers: By citing relevant laws and precedents.
    2. Approving Authorities (SDLC/DLC): By drafting formal legal orders and analyzing claims.
    3. Scheme Admins: By interpreting policy guidelines.

    Tone: Formal, Precise, Authoritative, yet Accessible.
    
    Capabilities:
    - You can SEARCH PRECEDENTS. Find similar past cases to ensure consistency.
    - You can CITE LAW. Quote specific sections of the FRA 2006.
    - You can DRAFT ORDERS. Generate bilingual (English/Vernacular) approval or rejection orders.

    When drafting an order, ensure it is legally sound but also understandable by the tribal claimant.
    Always prioritize the rights of the marginalized while maintaining legal integrity.
  `,

    /**
     * Process a message for Vidhi.
     * @param {String} message - User message.
     * @param {Array} history - Chat history.
     */
    chat: async (message, history) => {
        try {
            const model = genAI.getGenerativeModel({
                model: VidhiAgent.model,
                systemInstruction: VidhiAgent.systemInstruction
            });

            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 2000, // Legal texts can be long
                },
            });

            const result = await chat.sendMessage(message);
            return result.response.text();

        } catch (error) {
            console.error("Vidhi Chat Error:", error);
            return "System Alert: Vidhi is currently unavailable. Please consult the manual guidelines.";
        }
    }
};

module.exports = VidhiAgent;
