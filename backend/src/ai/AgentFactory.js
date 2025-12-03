const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const { citizenTools, dataEntryTools, ngoTools, executeMitraTool } = require('./tools/mitraTools');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AgentFactory {
    constructor() {
        this.models = {
            fast: 'gemini-2.5-flash',
            smart: 'gemini-2.5-pro'
        };
    }

    async getAgent(role, sessionId) {
        // Strict Role Locking
        if (['citizen', 'guest'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'citizen');
        }
        if (['data_entry', 'secretary', 'gram_sabha'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'data_entry');
        }
        if (['ngo', 'ngo_member'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'ngo');
        }

        // Future: Satark and Vidhi agents
        throw new Error(`Agent for role ${role} not yet implemented`);
    }
}

class MitraAgent {
    constructor(modelName, sessionId, subRole) {
        this.modelName = modelName;
        this.sessionId = sessionId;
        this.subRole = subRole;

        // Specialized Personas
        const personas = {
            'citizen': "You are Mitra, a helpful government assistant for the Forest Rights Act (FRA). You speak simple, respectful language. You help citizens find schemes, understand their rights, and check claim status.",
            'data_entry': "You are Mitra, a technical assistant for Data Entry Operators. You help validate claim forms, explain rejection reasons, and guide them through the digitization process. Be precise and technical. You do NOT answer general citizen queries. You do NOT provide statistics.",
            'ngo': "You are Mitra, a data analyst for NGOs. You provide statistics, regional insights, and transparency reports. Focus on data, trends, and impact metrics. You do NOT validate individual claims. You do NOT answer general citizen queries."
        };

        this.systemInstruction = personas[subRole] || personas['citizen'];

        // Strict Tool Assignment
        const toolSets = {
            'citizen': citizenTools,
            'data_entry': dataEntryTools,
            'ngo': ngoTools
        };
        this.tools = toolSets[subRole] || citizenTools;
    }

    async chat(userMessage) {
        // 1. Fetch chat history from MongoDB (last 10 messages)
        const history = await this.getHistory();

        // 2. Initialize Gemini model with tools
        const model = genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: this.systemInstruction,
            tools: [{ functionDeclarations: this.tools }]
        });

        // 3. Start chat with history
        const chat = model.startChat({
            history: history
        });

        // 4. Send user message
        let result = await chat.sendMessage(userMessage);

        // 5. Handle function calling (check if functionCalls exists)
        const functionCalls = result.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            console.log(`[Mitra] Calling function: ${functionCall.name}`);

            const functionResult = await executeMitraTool(functionCall);

            result = await chat.sendMessage([{
                functionResponse: {
                    name: functionCall.name,
                    response: { result: functionResult }
                }
            }]);
        }

        const finalResponse = result.response.text();

        // 6. Save conversation to DB
        await this.saveMessage('user', userMessage);
        await this.saveMessage('model', finalResponse);

        return finalResponse;
    }

    async getHistory() {
        const messages = await Message.find({ sessionId: this.sessionId })
            .sort({ timestamp: -1 })
            .limit(10);

        return messages.reverse().map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
    }

    async saveMessage(role, content) {
        await Message.create({
            sessionId: this.sessionId,
            role: role,
            content: content
        });
    }
}

module.exports = new AgentFactory();
