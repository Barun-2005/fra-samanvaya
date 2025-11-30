import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function SchemeRecommendations({ claimantId, village }) {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            // In a real app, we would pass actual claimant data
            // For now, we'll use the village and a mock profile
            const response = await api.post('/schemes/recommend', {
                claimantData: {
                    id: claimantId,
                    income: 45000, // Mock
                    caste: 'ST',   // Mock
                    occupation: 'Farmer'
                },
                assetData: {
                    village: village,
                    landSize: 2.5
                }
            });
            setSchemes(response.data.recommendations || []);
        } catch (err) {
            console.error('Error fetching schemes:', err);
            setError('Failed to load scheme recommendations');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    📋 Recommended Schemes
                </h3>
                <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="text-sm text-primary hover:underline"
                >
                    {loading ? 'Analyzing...' : 'Refresh Recommendations'}
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            {schemes.length === 0 && !loading && !error ? (
                <div className="text-center py-6 text-muted-foreground">
                    <p>Click refresh to get AI-powered scheme recommendations based on your profile.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {schemes.map((scheme, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-foreground">{scheme.name}</h4>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {Math.round(scheme.confidence * 100)}% Match
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{scheme.reason}</p>
                            <div className="mt-2 flex gap-2">
                                {scheme.benefits && scheme.benefits.map((benefit, bIdx) => (
                                    <span key={bIdx} className="text-xs bg-background border border-border px-2 py-1 rounded">
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
