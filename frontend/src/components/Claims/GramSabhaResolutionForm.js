import { useState } from 'react';
import { Users, Calendar, FileText, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

/**
 * Gram Sabha Resolution Form
 * Statutory requirement: Form B must be passed before claim is valid
 */
export default function GramSabhaResolutionForm({ claim, onComplete, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        resolutionNumber: '',
        resolutionDate: '',
        quorumMet: true,
        frcMemberCount: '',
        documentUrl: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.resolutionNumber || !formData.resolutionDate) {
            toast.error('Resolution number and date are required');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Recording Gram Sabha resolution...');

        try {
            const response = await api.post(`/claims/${claim._id}/gram-sabha-approve`, {
                resolutionNumber: formData.resolutionNumber,
                resolutionDate: formData.resolutionDate,
                quorumMet: formData.quorumMet,
                frcMemberCount: parseInt(formData.frcMemberCount) || 0,
                documentUrl: formData.documentUrl
            });

            toast.success(response.data.message || 'Gram Sabha resolution recorded!', { id: toastId });

            if (onComplete) {
                onComplete(response.data);
            }
        } catch (error) {
            console.error('Gram Sabha error:', error);
            toast.error(error.response?.data?.message || 'Failed to record resolution', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Gram Sabha Resolution (Form B)
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Record FRC resolution for claim: {claim.claimantName}
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-6">
                <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-800 dark:text-indigo-300">
                    <strong>FRA Rule 3:</strong> The Forest Rights Committee (FRC) must verify the claim and pass a resolution in the Gram Sabha with proper quorum before forwarding to SDLC.
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Resolution Number *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={formData.resolutionNumber}
                                onChange={(e) => setFormData({ ...formData, resolutionNumber: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., GS/2024/123"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Resolution Date *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={formData.resolutionDate}
                                onChange={(e) => setFormData({ ...formData, resolutionDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            FRC Members Present
                        </label>
                        <input
                            type="number"
                            value={formData.frcMemberCount}
                            onChange={(e) => setFormData({ ...formData, frcMemberCount: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Number of FRC members"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Resolution Document URL
                        </label>
                        <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="url"
                                value={formData.documentUrl}
                                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Link to scanned resolution"
                            />
                        </div>
                    </div>
                </div>

                {/* Quorum Confirmation */}
                <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input
                        type="checkbox"
                        checked={formData.quorumMet}
                        onChange={(e) => setFormData({ ...formData, quorumMet: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                            Quorum was met for this Gram Sabha meeting
                        </span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            As per Rule 3(1), majority of Gram Sabha members must be present
                        </p>
                    </div>
                    {formData.quorumMet && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.resolutionNumber || !formData.resolutionDate}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Recording...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Record Resolution
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
