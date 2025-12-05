import { useState } from 'react';
import { Users, Shield, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

/**
 * Joint Verification Form Component
 * Implements statutory requirement for dual Forest + Revenue signatures
 */
export default function JointVerificationForm({ claim, onComplete, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Forest Department Official
        forestOfficerName: '',
        forestOfficerDesignation: 'Range Forest Officer',
        forestOfficerSignature: false,
        // Revenue Department Official  
        revenueInspectorName: '',
        revenueInspectorDesignation: 'Revenue Inspector',
        revenueInspectorSignature: false,
        // Notes
        verificationNotes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate both signatures
        if (!formData.forestOfficerName || !formData.revenueInspectorName) {
            toast.error('Both Forest and Revenue officer names are required');
            return;
        }

        if (!formData.forestOfficerSignature || !formData.revenueInspectorSignature) {
            toast.error('Both officials must confirm their signature');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Submitting Joint Verification...');

        try {
            const response = await api.post(`/claims/${claim._id}/joint-verify`, {
                forestOfficerName: formData.forestOfficerName,
                forestOfficerDesignation: formData.forestOfficerDesignation,
                forestOfficerSignature: formData.forestOfficerSignature,
                revenueInspectorName: formData.revenueInspectorName,
                revenueInspectorDesignation: formData.revenueInspectorDesignation,
                revenueInspectorSignature: formData.revenueInspectorSignature,
                notes: formData.verificationNotes
            });

            toast.success(response.data.message || 'Joint Verification Complete!', { id: toastId });

            if (onComplete) {
                onComplete(response.data);
            }
        } catch (error) {
            console.error('Joint verification error:', error);
            toast.error(error.response?.data?.message || 'Verification failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Joint Verification
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Statutory requirement: Both Forest & Revenue officials must sign
                    </p>
                </div>
            </div>

            {/* Claim Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500">Claimant:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {claim.claimantName}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Village:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {claim.village}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Area:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {claim.landSizeClaimed} Ha
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Survey No:</span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {claim.surveyNumber || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Forest Department Section */}
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800 dark:text-green-400">
                            Forest Department Official
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Officer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.forestOfficerName}
                                onChange={(e) => setFormData({ ...formData, forestOfficerName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Designation
                            </label>
                            <select
                                value={formData.forestOfficerDesignation}
                                onChange={(e) => setFormData({ ...formData, forestOfficerDesignation: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            >
                                <option value="Range Forest Officer">Range Forest Officer</option>
                                <option value="Deputy Range Officer">Deputy Range Officer</option>
                                <option value="Forest Guard">Forest Guard</option>
                                <option value="Forester">Forester</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.forestOfficerSignature}
                            onChange={(e) => setFormData({ ...formData, forestOfficerSignature: e.target.checked })}
                            className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            I confirm my identity and certify the verification details
                        </span>
                        {formData.forestOfficerSignature && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                    </label>
                </div>

                {/* Revenue Department Section */}
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                            Revenue Department Official
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Officer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.revenueInspectorName}
                                onChange={(e) => setFormData({ ...formData, revenueInspectorName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Designation
                            </label>
                            <select
                                value={formData.revenueInspectorDesignation}
                                onChange={(e) => setFormData({ ...formData, revenueInspectorDesignation: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Revenue Inspector">Revenue Inspector (RI)</option>
                                <option value="Circle Officer">Circle Officer</option>
                                <option value="Tehsildar">Tehsildar</option>
                                <option value="Patwari">Patwari</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.revenueInspectorSignature}
                            onChange={(e) => setFormData({ ...formData, revenueInspectorSignature: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            I confirm my identity and certify the verification details
                        </span>
                        {formData.revenueInspectorSignature && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Verification Notes (Optional)
                    </label>
                    <textarea
                        value={formData.verificationNotes}
                        onChange={(e) => setFormData({ ...formData, verificationNotes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                        placeholder="Any observations or notes..."
                    />
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        Both officials must be physically present and sign. Single-signature verification is legally void under FRA Rules 2008.
                    </p>
                </div>

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
                        disabled={loading || !formData.forestOfficerSignature || !formData.revenueInspectorSignature}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Submit Joint Verification
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
