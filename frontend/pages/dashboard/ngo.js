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
    CheckCircle
} from 'lucide-react';

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

    return (
        <RoleGuard allowedRoles={['NGO Member', 'Public Viewer', 'NGO Viewer']}>
            <DashboardLayout>
                <Head>
                    <title>NGO Viewer Dashboard | FRA Samanvay</title>
                </Head>

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
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                    <Download className="w-5 h-5" />
                                    Export Data
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
                            <AtlasMap />
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
