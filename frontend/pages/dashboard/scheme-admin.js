import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import SchemeRecommendations from '../../src/components/Dashboard/SchemeRecommendations';
import PolicyMatcherPanel from '../../src/components/Dashboard/PolicyMatcherPanel';
import {
    BarChart2,
    PieChart,
    Users,
    FileText,
    Settings,
    Plus,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MapIcon
} from 'lucide-react';

// Dynamic import for AtlasMap (avoid SSR issues)
const AtlasMap = dynamic(() => import('../../src/components/Atlas/AtlasMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
});

export default function SchemeAdminDashboard() {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [stats, setStats] = useState({ totalClaims: 0, eligibleClaims: 0, schemesActive: 12 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            setStats({
                totalClaims: claimsArray.length,
                eligibleClaims: claimsArray.filter(c => c.status === 'Approved').length,
                schemesActive: 12 // Mock for now
            });

            // Mock scheme data
            setSchemes([
                { id: 1, name: 'Forest Rights Act 2006', beneficiaries: 12500, status: 'Active', budget: '₹50 Cr' },
                { id: 2, name: 'PM Van Dhan Yojana', beneficiaries: 8200, status: 'Active', budget: '₹25 Cr' },
                { id: 3, name: 'Eco-Tourism Initiative', beneficiaries: 1500, status: 'Draft', budget: '₹10 Cr' },
            ]);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RoleGuard allowedRoles={['Scheme Admin', 'Super Admin']}>
            <DashboardLayout>
                <Head>
                    <title>Scheme Administration | FRA Samanvay</title>
                </Head>

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Scheme Administration
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Manage government schemes and analyze performance.
                                </p>
                            </div>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" />
                                Add New Scheme
                            </button>
                        </div>

                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClaims}</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +5.4%
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Eligible Beneficiaries</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.eligibleClaims}</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <PieChart className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        Active Schemes
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Active Schemes</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.schemesActive}</p>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="space-y-8">
                            {/* Regional Budget Planner with GIS */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapIcon className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Regional Budget Planner (GIS Atlas)</h2>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Draw a region on the map to analyze claim distribution and estimate budget requirements for schemes.
                                </p>
                                <AtlasMap />
                            </div>

                            {/* Policy Matcher Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <PolicyMatcherPanel />
                            </div>

                            {/* Scheme Analysis */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Beneficiary Scheme Analysis</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Analyze specific beneficiary data to recommend suitable government schemes.
                                </p>
                                <SchemeRecommendations
                                    claimantId="admin-view"
                                    village="All Villages"
                                />
                            </div>

                            {/* Scheme List */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Schemes</h2>
                                    <button className="text-primary font-bold text-sm hover:underline">View All</button>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {schemes.map((scheme) => (
                                        <div key={scheme.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold text-lg">
                                                    {scheme.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{scheme.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Budget: {scheme.budget} • {scheme.beneficiaries.toLocaleString()} Beneficiaries
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${scheme.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {scheme.status}
                                                </span>
                                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
