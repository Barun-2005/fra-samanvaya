import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AIAnalysisCard({ claimId, initialAnalysis }) {
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [loading, setLoading] = useState(false);

    const requestAnalysis = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/assets/analyze/${claimId}`);
            setAnalysis(response.data);
            toast.success('AI analysis completed!');
        } catch (error) {
            toast.error('Failed to analyze claim. ' + (error.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">🤖 AI Asset Analysis</h3>
                <p className="text-muted-foreground mb-4">
                    Use AI to analyze satellite imagery and calculate veracity score
                </p>
                <button
                    onClick={requestAnalysis}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
                >
                    🔍 Request AI Analysis
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-32 bg-muted rounded"></div>
                </div>
                <p className="text-muted-foreground text-center mt-4">Analyzing with AI...</p>
            </div>
        );
    }

    if (!analysis) return null;

    const veracityScore = analysis.metadata?.confidence ? Math.round(analysis.metadata.confidence * 100) : 75;
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">🤖 AI Asset Analysis</h3>

            {/* Veracity Score */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Veracity Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(veracityScore)}`}>
                        {veracityScore}%
                    </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${veracityScore >= 80 ? 'bg-green-600' :
                                veracityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                        style={{ width: `${veracityScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Land Cover Breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Land Cover Analysis:</h4>

                {analysis.assetSummary?.forestHa > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🌲 Forest Area:</span>
                        <span className="font-medium text-foreground">{analysis.assetSummary.forestHa.toFixed(2)} ha</span>
                    </div>
                )}

                {analysis.assetSummary?.farmlandHa > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🌾 Farmland:</span>
                        <span className="font-medium text-foreground">{analysis.assetSummary.farmlandHa.toFixed(2)} ha</span>
                    </div>
                )}

                {analysis.assetSummary?.waterAreasHa > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">💧 Water Bodies:</span>
                        <span className="font-medium text-foreground">{analysis.assetSummary.waterAreasHa.toFixed(2)} ha</span>
                    </div>
                )}

                {analysis.assetSummary?.homesteadCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🏠 Homesteads:</span>
                        <span className="font-medium text-foreground">{analysis.assetSummary.homesteadCount}</span>
                    </div>
                )}
            </div>

            {/* Analysis Summary */}
            {analysis.metadata?.analysis && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">{analysis.metadata.analysis}</p>
                </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground">
                Model: {analysis.assetSummary?.modelVersion || 'Gemini AI'}
            </div>
        </div>
    );
}
