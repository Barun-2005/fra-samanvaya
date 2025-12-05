const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const { citizenTools, dataEntryTools, ngoTools, commonTools, executeMitraTool } = require('./tools/mitraTools');
const { vidhiToolDefinitions, executeVidhiTool } = require('./tools/vidhiTools');
const SatarkConfig = require('./agents/SatarkAgent'); // Import config
const VidhiConfig = require('./agents/VidhiAgent'); // Import Vidhi
const satarkTools = require('./tools/satarkTools'); // Import tools

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AgentFactory {
    constructor() {
        this.models = {
            fast: 'gemini-2.5-flash',
            smart: 'gemini-2.5-flash', // Temporarily using flash for Vidhi to ensure stability
            vision: 'gemini-2.0-flash-exp' // Satark needs vision
        };
    }

    async getAgent(role, sessionId, context = {}) {
        // Strict Role Locking
        if (['citizen', 'guest'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'citizen', context);
        }
        if (['data_entry', 'secretary', 'gram_sabha'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'data_entry', context);
        }
        if (['ngo', 'ngo_member'].includes(role)) {
            return new MitraAgent(this.models.fast, sessionId, 'ngo', context);
        }

        // SATARK (Vigilance)
        if (['field_worker', 'verification_officer', 'super_admin'].includes(role)) {
            return new SatarkAgent(this.models.vision, sessionId, role, context);
        }

        // VIDHI (Governance)
        if (['approving_authority', 'scheme_admin', 'official'].includes(role)) {
            return new VidhiAgent(this.models.smart, sessionId, role, context);
        }

        throw new Error(`Agent for role ${role} not yet implemented`);
    }
}

class MitraAgent {
    constructor(modelName, sessionId, subRole, context = {}) {
        this.modelName = modelName;
        this.sessionId = sessionId;
        this.subRole = subRole;
        this.context = context;

        // Specialized Personas
        const personas = {
            'citizen': "You are Mitra, a helpful government assistant for the Forest Rights Act (FRA). You speak simple, respectful language. You help citizens find schemes, understand their rights, and check claim status.",
            'data_entry': "You are Mitra, a technical assistant for Data Entry Operators. You help validate claim forms, explain rejection reasons, and guide them through the digitization process. Be precise and technical. You do NOT answer general citizen queries. You do NOT provide statistics.",
            'ngo': "You are Mitra, a data analyst for NGOs. You provide statistics, regional insights, and transparency reports. Focus on data, trends, and impact metrics. You do NOT validate individual claims. You do NOT answer general citizen queries."
        };

        let instruction = personas[subRole] || personas['citizen'];

        // Context Injection
        if (this.context.userId) {
            instruction += `\n\nCURRENT USER CONTEXT:\nUser ID: ${this.context.userId}`;
            if (this.context.claimId) {
                instruction += `\nFocus Claim ID: ${this.context.claimId} (The user is currently viewing this claim).`;
            }
        }

        this.systemInstruction = instruction;

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

            // Inject userId into tool call if missing and needed
            if (functionCall.name === 'getUserClaims' && !functionCall.args.userId && this.context.userId) {
                functionCall.args.userId = this.context.userId;
            }

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

class SatarkAgent {
    constructor(modelName, sessionId, subRole, context = {}) {
        this.modelName = modelName;
        this.sessionId = sessionId;
        this.subRole = subRole;
        this.context = context;

        // Specialized Personas for Satark
        const personas = {
            'field_worker': `You are SATARK, the Field Vigilance AI. 
            You assist Field Workers on the ground.
            Your Tasks:
            1. Verify GPS coordinates: Ensure the worker is physically at the claimed land.
            2. Analyze Evidence: Check photos of boundaries and vegetation.
            3. Guide the worker: Tell them if they need to retake a photo or move to a corner.
            Tone: Direct, Operational, Helpful.`,

            'verification_officer': `You are SATARK, the Verification Officer's AI Analyst.
            You assist the Officer in validating submitted claims.
            Your Tasks:
            1. Scrutinize Evidence: Compare submitted documents with satellite data (simulated).
            2. Highlight Discrepancies: Point out if the land size claimed matches the boundary map.
            3. Check Eligibility: Verify if the claimant meets the 75-year or 3-generation rule based on documents.
            Tone: Analytical, Skeptical, Precise.
            IMPORTANT: You are talking to an Officer. Do not list your capabilities. Just answer their questions about the claim.`,

            'super_admin': `You are SATARK, the System Overseer.
            Your Tasks:
            1. Detect Fraud: Look for patterns like duplicate fingerprints or mass claims from one IP.
            2. Monitor System Health.
            Tone: Authoritative, Strategic.`
        };

        let instruction = personas[this.subRole] || SatarkConfig.systemInstruction;

        if (this.context.userId) {
            instruction += `\n\nCURRENT USER CONTEXT:\nUser ID: ${this.context.userId}`;
            if (this.context.claimId) {
                instruction += `\nFocus Claim ID: ${this.context.claimId} (The officer is currently verifying this claim).`;
                instruction += `\nIMPORTANT: You have the Claim ID. Use 'lookup_claim_status' to get details if needed.`;
            }
        }

        this.systemInstruction = instruction;
        // Satark gets Common Tools (Claims) + Vision Tools (Future)
        this.tools = commonTools;
    }

    async chat(userMessage) {
        const history = await this.getHistory();

        const model = genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: this.systemInstruction,
            tools: [{ functionDeclarations: this.tools }]
        });

        const chat = model.startChat({ history: history });

        let result = await chat.sendMessage(userMessage);

        // Handle Tool Calls (Satark using Mitra's common tools)
        const functionCalls = result.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            console.log(`[Satark] Calling function: ${functionCall.name}`);

            if (functionCall.name === 'get_user_claims' && !functionCall.args.userId && this.context.userId) {
                functionCall.args.userId = this.context.userId;
            }

            // Execute using Mitra's executor as these are common tools
            const functionResult = await executeMitraTool(functionCall);

            result = await chat.sendMessage([{
                functionResponse: {
                    name: functionCall.name,
                    response: { result: functionResult }
                }
            }]);
        }

        const finalResponse = result.response.text();

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

class VidhiAgent {
    constructor(modelName, sessionId, subRole, context = {}) {
        this.modelName = modelName;
        this.sessionId = sessionId;
        this.subRole = subRole;
        this.context = context;

        let instruction = VidhiConfig.systemInstruction;
        if (this.context.userId) {
            instruction += `\n\nCURRENT USER CONTEXT:\nUser ID: ${this.context.userId}`;
            if (this.context.claimId) {
                instruction += `\nFocus Claim ID: ${this.context.claimId} (The user is currently viewing this claim).`;
                instruction += `\nIMPORTANT: You have the Claim ID. IMMEDIATELY use the 'lookup_claim_status' tool to fetch the full details (evidence, type, reasoning) of this claim. DO NOT ask the user for these details. Fetch them yourself.`;
            }
        }

        this.systemInstruction = instruction;
        // Vidhi gets Vidhi Tools + Common Tools (Claims)
        this.tools = [...vidhiToolDefinitions, ...commonTools];
    }

    async chat(userMessage) {
        const history = await this.getHistory();

        const model = genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: this.systemInstruction,
            tools: [{ functionDeclarations: this.tools }]
        });

        const chat = model.startChat({ history: history });
        let result = await chat.sendMessage(userMessage);

        // Handle Tool Calls
        const functionCalls = result.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            console.log(`[Vidhi] Calling function: ${functionCall.name}`);

            // Inject context
            if (functionCall.name === 'draft_order' && !functionCall.args.claimId && this.context.claimId) {
                functionCall.args.claimId = this.context.claimId;
            }
            if (functionCall.name === 'get_user_claims' && !functionCall.args.userId && this.context.userId) {
                functionCall.args.userId = this.context.userId;
            }

            let functionResult;
            // Route to correct executor
            if (['search_precedents', 'fetch_laws', 'draft_order'].includes(functionCall.name)) {
                functionResult = await executeVidhiTool(functionCall);
            } else {
                functionResult = await executeMitraTool(functionCall);
            }

            result = await chat.sendMessage([{
                functionResponse: {
                    name: functionCall.name,
                    response: { result: functionResult }
                }
            }]);
        }

        const finalResponse = result.response.text();

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
