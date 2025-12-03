import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import {
    Globe,
    BarChart2,
    TrendingUp,
    Users,
    Map as MapIcon,
    Download,
    ChevronDown,
    Search,
    CheckCircle,
    FileText,
    X,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamic import for AtlasMap (avoid SSR issues)
const AtlasMap = dynamic(() => import('../../src/components/Atlas/AtlasMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
});

export default function NGODashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ submitted: 0, approved: 0, rejected: 0, avgTime: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch real claim data
            const response = await api.get('/claims');
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            // Calculate real stats
            const submitted = claimsArray.length;
            const approved = claimsArray.filter(c => c.status === 'Approved').length;
            const rejected = claimsArray.filter(c => c.status === 'Rejected').length;

            // Calculate average processing time (mock for now as we'd need dateSubmitted and dateProcessed)
            const avgTime = 85; // This should be calculated from actual date differences

            setStats({
                submitted,
                approved,
                rejected,
                avgTime
            });
        } catch (err) {
            console.error('Error:', err);
            // Fallback to placeholder data on error
            setStats({
                submitted: 0,
                approved: 0,
                rejected: 0,
                avgTime: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const [showReportModal, setShowReportModal] = useState(false);
    const [regionAnalysis, setRegionAnalysis] = useState(null);

    return (
        <RoleGuard allowedRoles={['NGO Member', 'Public Viewer', 'NGO Viewer']}>
            <DashboardLayout>
                <Head>
                    <title>NGO Viewer Dashboard | FRA Samanvay</title>
                </Head>

                {/* Report Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-primary" />
                                    {regionAnalysis ? 'Regional Impact Assessment' : 'General Impact Report'}
                                </h3>
                                <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-slate-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase tracking-wide">Report Region</p>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                            {regionAnalysis ? 'Selected Region' : 'Odisha State'}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Generated On</p>
                                        <p className="font-medium">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-primary">
                                            {regionAnalysis ? regionAnalysis.transparencyScore : '1,240'}
                                        </p>
                                        <p className="text-xs text-slate-500 uppercase">
                                            {regionAnalysis ? 'Transparency Score' : 'Claims Processed'}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {regionAnalysis ? `${regionAnalysis.landCover.forestPercentage}%` : '68%'}
                                        </p>
                                        <p className="text-xs text-green-600 uppercase">
                                            {regionAnalysis ? 'Forest Cover' : 'Approval Rate'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {regionAnalysis ? `${regionAnalysis.landCover.waterPercentage}%` : '450 ha'}
                                        </p>
                                        <p className="text-xs text-blue-600 uppercase">
                                            {regionAnalysis ? 'Water Bodies' : 'Land Titled'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Key Insights</h4>
                                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        {regionAnalysis ? (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                    {regionAnalysis.analysis.split('.')[0]}.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                    Recommended Scheme: {regionAnalysis.schemes[0]?.name}.
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                    Approval rate in tribal districts has improved by 15% this quarter.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                    Average processing time reduced from 90 days to 85 days.
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-800/50">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    NGO Viewer Dashboard
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Transparency metrics and impact analysis.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Last 6 Months <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!regionAnalysis) {
                                            toast('Please select a region on the map first for a detailed report.', { icon: '🗺️' });
                                        }
                                        const toastId = toast.loading('Generating Impact Report...');
                                        setTimeout(() => {
                                            toast.success('Report Generated!', { id: toastId });
                                            setShowReportModal(true);
                                        }, 1500);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                                >
                                    <FileText className="w-5 h-5" />
                                    {regionAnalysis ? 'Generate Regional Report' : 'Generate General Report'}
                                </button>
                            </div>
                        </div>

                        {/* Interactive GIS Atlas */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapIcon className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Regional Transparency Analysis</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                Draw a region to analyze claim distribution, forest conservation impact, and transparency metrics for that area.
                            </p>
                            <AtlasMap onAnalysisComplete={setRegionAnalysis} />
                        </div>

                        {/* Transparency Metrics */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Transparency Metrics</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims Submitted</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.submitted.toLocaleString()}</p>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" /> +12.5%
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Claims Approved</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.approved.toLocaleString()}</p>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" /> +8.2%
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Claims Rejected</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.rejected.toLocaleString()}</p>
                                    <p className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" /> +2.1%
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Avg. Processing Time</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgTime} Days</p>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 rotate-180" /> -5 days
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Impact Dashboard Info */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Regional Impact Analysis</h2>
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                                <MapIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Draw a Region on the Map Above</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                    Use the interactive GIS Atlas above to draw a specific region. The AI will analyze that region's:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-3xl mx-auto text-left">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Forest Land Titled</p>
                                            <p className="text-sm text-slate-500">Hectares of forest rights granted</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Families Benefited</p>
                                            <p className="text-sm text-slate-500">Number of approved claims</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Land Cover Analysis</p>
                                            <p className="text-sm text-slate-500">Forest vs farmland percentages</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BarChart2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Transparency Score</p>
                                            <p className="text-sm text-slate-500">Approval ratio and fairness metrics</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
