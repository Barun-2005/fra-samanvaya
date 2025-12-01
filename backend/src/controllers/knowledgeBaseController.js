const ragService = require('../services/ragService');

exports.ingestDocument = async (req, res) => {
    try {
        const { title, content, source, category } = req.body;
        if (!title || !content || !source) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await ragService.ingestDocument(title, content, source, category);
        res.json({ message: 'Document ingested successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to ingest document' });
    }
};

exports.queryKnowledgeBase = async (req, res) => {
    try {
        const { query, roleContext } = req.body;
        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const result = await ragService.queryKnowledgeBase(query, roleContext);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to query knowledge base' });
    }
};
