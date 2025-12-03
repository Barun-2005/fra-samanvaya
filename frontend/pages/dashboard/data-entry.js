import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import {
    PlusCircle,
    Upload,
    FileText,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';

export default function DataEntryDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
    const [recentClaims, setRecentClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims'); // Fetch all to calc stats
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            setRecentClaims(claimsArray.slice(0, 10)); // Only show recent 10 in table

            // Calculate real stats
            const today = new Date().toDateString();
            setStats({
                pending: claimsArray.filter(c => c.status === 'Submitted' || c.status === 'ConflictDetected').length,
                today: claimsArray.filter(c => new Date(c.createdAt).toDateString() === today).length,
                total: claimsArray.length
            });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClaims = recentClaims.filter(claim =>
        claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.village?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RoleGuard allowedRoles={['Data Entry Operator', 'Data Entry Officer', 'Secretary', 'Gram Sabha']}>
            <DashboardLayout>
                <Head>
                    <title>Data Entry Dashboard | FRA Samanvay</title>
                </Head>

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Data Entry Dashboard
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Digitize and manage forest rights claims.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <Upload className="w-5 h-5" />
                                    Bulk Upload
                                </button>
                                <Link href="/create-claim">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                        <PlusCircle className="w-5 h-5" />
                                        New Claim
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Pending Verification</p>
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Today's Entries</p>
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.today}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims</p>
                                <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions & Metrics Sidebar */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                                    <div className="flex flex-col gap-3">
                                        <Link href="/create-claim">
                                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors">
                                                <PlusCircle className="w-5 h-5" />
                                                Create New Claim
                                            </button>
                                        </Link>
                                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-colors">
                                            <Upload className="w-5 h-5" />
                                            Upload Bulk CSV
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Performance Metrics</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">Claims Processed (Week)</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{stats.week}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">Avg. Processing Time</span>
                                            <span className="font-bold text-slate-900 dark:text-white">2.5 days</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">Accuracy Rate</span>
                                            <span className="font-bold text-slate-900 dark:text-white">98.2%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Submissions Table */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Submissions</h2>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <div className="flex items-center gap-2 flex-grow sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-slate-500 dark:placeholder:text-slate-400 min-w-0"
                                            />
                                        </div>
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <Filter className="w-4 h-4 text-slate-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">Claim ID</th>
                                                <th className="px-6 py-3">Applicant Name</th>
                                                <th className="px-6 py-3">Village</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                    </td>
                                                </tr>
                                            ) : filteredClaims.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="p-12 text-center text-slate-500">
                                                        No recent claims found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredClaims.map((claim) => (
                                                    <tr key={claim._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                                            #{claim._id.slice(-6).toUpperCase()}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                            {claim.claimantName}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                            {claim.village}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                            {new Date(claim.dateSubmitted || Date.now()).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claim.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                claim.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {claim.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link href={`/claims/${claim._id}`}>
                                                                <button className="text-primary hover:text-primary-hover font-medium hover:underline">
                                                                    View
                                                                </button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Showing {filteredClaims.length} results
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
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
