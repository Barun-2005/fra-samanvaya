const anomalyDetector = require('../services/anomalyDetector');

exports.getSystemAnomalies = async (req, res) => {
    try {
        const anomalies = await anomalyDetector.detectAnomalies();
        res.json(anomalies);
    } catch (error) {
        console.error('Anomaly detection error:', error);
        res.status(500).json({ message: 'Failed to detect anomalies' });
    }
};
