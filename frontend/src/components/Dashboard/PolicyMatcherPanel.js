import { useState } from 'react';
import api from '../../lib/api';

export default function PolicyMatcherPanel() {
    const [villageData, setVillageData] = useState({
        village: '',
        district: '',
        approvedClaims: 0,
        totalLand: 0
    });
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleMatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/schemes/match', villageData);
            setRecommendations(response.data);
        } catch (error) {
            console.error("Failed to match schemes", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🤝</span>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Policy Matcher (AI)</h2>
                    <p className="text-sm text-muted-foreground">Find best-fit schemes for a village</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Input Form */}
                <form onSubmit={handleMatch} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground">Village Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-input rounded-lg bg-background"
                            value={villageData.village}
                            onChange={e => setVillageData({ ...villageData, village: e.target.value })}
                            placeholder="e.g. Rampur"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">District</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-input rounded-lg bg-background"
                            value={villageData.district}
                            onChange={e => setVillageData({ ...villageData, district: e.target.value })}
                            placeholder="e.g. Gadchiroli"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Claims</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-input rounded-lg bg-background"
                                value={villageData.approvedClaims}
                                onChange={e => setVillageData({ ...villageData, approvedClaims: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Land (Ha)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-input rounded-lg bg-background"
                                value={villageData.totalLand}
                                onChange={e => setVillageData({ ...villageData, totalLand: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Find Schemes'}
                    </button>
                </form>

                {/* Results */}
                <div className="md:col-span-2 space-y-4">
                    {recommendations.length === 0 && !loading && (
                        <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl p-8">
                            Enter village details to see AI recommendations.
                        </div>
                    )}

                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-foreground">{rec.schemeName}</h3>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {rec.relevanceScore}% Match
                                </span>
                            </div>
                            <p className="text-sm text-foreground mt-2">{rec.reason}</p>
                            <div className="mt-3 text-xs text-muted-foreground">
                                <strong>Benefits:</strong> {rec.benefits}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
