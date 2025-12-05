const { vidhiTools } = require('../ai/tools/vidhiTools');

exports.draftOrder = async (req, res) => {
    try {
        const { claimId, verdict, reasoning } = req.body;
        if (!claimId || !verdict || !reasoning) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await vidhiTools.draftOrder(claimId, verdict, reasoning);
        res.json(result);
    } catch (error) {
        console.error('Draft Order Error:', error);
        res.status(500).json({ message: 'Failed to draft order' });
    }
};

exports.searchPrecedents = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const results = await vidhiTools.searchPrecedents(query);
        res.json(results);
    } catch (error) {
        console.error('Search Precedents Error:', error);
        res.status(500).json({ message: 'Failed to search precedents' });
    }
};

exports.fetchLaws = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const result = await vidhiTools.fetchLaws(query);
        res.json({ answer: result });
    } catch (error) {
        console.error('Fetch Laws Error:', error);
        res.status(500).json({ message: 'Failed to fetch laws' });
    }
};
