import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, ExternalLink, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

/**
 * Title Deed Download Component
 * Generates and downloads Form C (Title Deed) as per FRA Rules 2008
 */
export default function TitleDeedDownload({ claim, onGenerated }) {
    const [loading, setLoading] = useState(false);
    const [titleDeed, setTitleDeed] = useState(claim.titleDeed || null);

    const generateTitleDeed = async () => {
        if (claim.status !== 'Approved') {
            toast.error('Title Deed can only be generated for approved claims');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Generating Title Deed (Form C)...');

        try {
            const response = await api.post(`/claims/${claim._id}/generate-title-deed`);

            setTitleDeed({
                pdfUrl: response.data.pdfUrl,
                serialNumber: response.data.serialNumber,
                generatedAt: new Date()
            });

            toast.success('Title Deed generated successfully!', { id: toastId });

            if (onGenerated) {
                onGenerated(response.data);
            }
        } catch (error) {
            console.error('Title deed error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate Title Deed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (titleDeed?.pdfUrl) {
            // Open in new tab for printing
            window.open(titleDeed.pdfUrl, '_blank');
        }
    };

    const handlePrint = () => {
        if (titleDeed?.pdfUrl) {
            const printWindow = window.open(titleDeed.pdfUrl, '_blank');
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    // Already has title deed
    if (titleDeed?.pdfUrl) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
                            Title Deed Issued
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Serial: {titleDeed.serialNumber}
                        </p>
                    </div>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
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
                            <span className="text-slate-500">Generated:</span>
                            <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                {new Date(titleDeed.generatedAt).toLocaleDateString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-5 h-5" />
                        View Document
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        Print
                    </button>
                </div>
            </div>
        );
    }

    // Not yet generated or not approved
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Title Deed (Form C)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Generate official certificate under FRA Rules 2008
                    </p>
                </div>
            </div>

            {claim.status === 'Approved' ? (
                <>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        This claim has been approved by the DLC. You can now generate the official Title Deed document.
                    </p>
                    <button
                        onClick={generateTitleDeed}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Generate Title Deed
                            </>
                        )}
                    </button>
                </>
            ) : (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        Title Deed can only be generated after DLC approval
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Current Status: <span className="font-medium">{claim.status}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
