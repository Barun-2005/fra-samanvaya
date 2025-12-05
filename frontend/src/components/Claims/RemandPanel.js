import { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, MessageSquare, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

/**
 * Remand Panel Component
 * Allows SDLC to remand claims back to Gram Sabha with Vidhi AI suggestions
 */
export default function RemandPanel({ claim, onRemand, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [remandReason, setRemandReason] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);

    // Fetch AI suggestions on mount
    useEffect(() => {
        fetchRemandSuggestions();
    }, [claim._id]);

    const fetchRemandSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const response = await api.get(`/claims/${claim._id}/remand-suggestions`);
            setAiSuggestions(response.data.suggestions || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            // Set default suggestions
            setAiSuggestions([
                { reason: 'Incomplete Gram Sabha resolution', evidence_needed: 'Updated Form B with proper quorum' },
                { reason: 'Land boundary unclear', evidence_needed: 'Re-survey with GPS coordinates' },
                { reason: 'Missing witness testimonies', evidence_needed: 'Elderly witness statements' }
            ]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleRemand = async () => {
        if (!remandReason.trim()) {
            toast.error('Please provide a remand reason');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Processing remand...');

        try {
            const response = await api.post(`/claims/${claim._id}/remand`, {
                reason: remandReason,
                targetStage: 'GramSabhaApproved'
            });

            toast.success('Claim remanded to Gram Sabha', { id: toastId });

            if (onRemand) {
                onRemand(response.data);
            }
        } catch (error) {
            console.error('Remand error:', error);
            toast.error(error.response?.data?.message || 'Remand failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const applySuggestion = (suggestion) => {
        setRemandReason(`${suggestion.reason}. Required: ${suggestion.evidence_needed}`);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Remand to Gram Sabha
                    </h2>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        Send back for additional evidence (FRA Rule 4)
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Statutory Note:</strong> Under FRA 2006, SDLC cannot reject a claim without first giving the Gram Sabha an opportunity to submit additional evidence. Use this remand option before rejection.
                </div>
            </div>

            {/* AI Suggestions */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Vidhi AI Suggestions
                    </h3>
                </div>

                {loadingSuggestions ? (
                    <div className="flex items-center gap-2 text-slate-500 py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing claim for remand reasons...</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {aiSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => applySuggestion(suggestion)}
                                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-colors group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                                            {suggestion.reason}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Evidence needed: {suggestion.evidence_needed}
                                        </p>
                                    </div>
                                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Use this
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Reason */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Remand Reason *
                </label>
                <textarea
                    value={remandReason}
                    onChange={(e) => setRemandReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="Specify what additional evidence the Gram Sabha should provide..."
                    required
                />
                <p className="text-xs text-slate-500 mt-1">
                    This reason will be communicated to the FRC for action
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleRemand}
                    disabled={loading || !remandReason.trim()}
                    className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <RotateCcw className="w-5 h-5" />
                            Remand Claim
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
