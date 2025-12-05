const AgentFactory = require('../ai/AgentFactory');

exports.chatWithAgent = async (req, res) => {
    try {
        const { message, role = 'citizen', sessionId, userId, context } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Use user ID as session ID if not provided
        const finalSessionId = sessionId || req.user?.id || 'anonymous-' + Date.now();

        console.log(`[Chat] Role: ${role}, User: ${userId}, Context: ${JSON.stringify(context)}`);

        // Get agent based on role, passing user context
        const agent = await AgentFactory.getAgent(role, finalSessionId, { userId, ...context });

        // Chat returns the final response after tool execution
        const response = await agent.chat(message);

        res.json({
            response: response,
            sessionId: finalSessionId
        });

    } catch (error) {
        console.error("Agent Chat Error:", error);
        res.status(500).json({ message: "Error processing chat request", error: error.message });
    }
};
