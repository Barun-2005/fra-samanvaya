import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SchemeRecommendationsWidget({ claimId }) {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (claimId) {
            fetchRecommendations();
        }
    }, [claimId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/schemes/recommend/${claimId}`);
            setRecommendations(response.data);
        } catch (err) {
            console.error('Error fetching schemes:', err);
            setError('Failed to load scheme recommendations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-20 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-red-500 text-sm mb-2">{error}</div>
                <button
                    onClick={fetchRecommendations}
                    className="text-primary text-sm hover:underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    ✨ Recommended Schemes
                </h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    AI Powered
                </span>
            </div>

            <div className="space-y-4">
                {recommendations.map((scheme, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <h4 className="font-semibold text-foreground mb-1">{scheme.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{scheme.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-medium text-foreground">Benefit:</span>
                                <span className="text-muted-foreground ml-1">{scheme.benefit}</span>
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Eligibility:</span>
                                <span className="text-muted-foreground ml-1">{scheme.eligibility}</span>
                            </div>
                        </div>

                        {scheme.matchReason && (
                            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span>✓</span>
                                <span>{scheme.matchReason}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-center text-muted-foreground">
                Recommendations based on land size, location, and claimant profile.
            </div>
        </div>
    );
}
