import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function ApprovalDashboard() {
    const { user } = useAuth();
    const [approvalQueue, setApprovalQueue] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClaims, setSelectedClaims] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            // Filter for verified claims awaiting approval
            const verified = claimsArray.filter(c => c.status === 'Verified');
            setApprovalQueue(verified);

            // Mock stats
            setStats({
                pending: verified.length,
                approved: 1204,
                rejected: 87
            });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectClaim = (id) => {
        if (selectedClaims.includes(id)) {
            setSelectedClaims(selectedClaims.filter(c => c !== id));
        } else {
            setSelectedClaims([...selectedClaims, id]);
        }
    };

    const filteredQueue = approvalQueue.filter(claim =>
        claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.village?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RoleGuard allowedRoles={['Approving Authority', 'District Collector', 'SDLC']}>
            <DashboardLayout>
                <Head>
                    <title>Approval Dashboard | FRA Samanvay</title>
                </Head>

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Approving Authority Dashboard
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Review and finalize forest rights claims.
                                </p>
                            </div>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                <Download className="w-5 h-5" />
                                Export Monthly Report
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims Approved</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.approved.toLocaleString()}</span>
                                    <span className="text-sm font-bold text-green-600 mb-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">+5.2%</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims Rejected</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.rejected}</span>
                                    <span className="text-sm font-bold text-red-600 mb-1 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">-1.8%</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Avg. Processing Time</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">21 Days</span>
                                    <span className="text-sm font-bold text-green-600 mb-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">-2.1%</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Table Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Pending Claims for Approval
                                </h2>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex items-center gap-2 flex-1 sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID or Name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white p-0 min-w-0"
                                        />
                                    </div>
                                    <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <Filter className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Actions Bar */}
                            {selectedClaims.length > 0 && (
                                <div className="bg-primary/5 border-b border-primary/10 p-3 flex items-center justify-between px-6 animate-in slide-in-from-top-2">
                                    <span className="text-sm font-medium text-primary">
                                        {selectedClaims.length} claims selected
                                    </span>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                                            <ThumbsUp className="w-4 h-4" /> Approve Selected
                                        </button>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                                            <ThumbsDown className="w-4 h-4" /> Reject Selected
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                        <tr>
                                            <th className="p-4 w-12">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedClaims(filteredQueue.map(c => c._id));
                                                        } else {
                                                            setSelectedClaims([]);
                                                        }
                                                    }}
                                                    checked={selectedClaims.length === filteredQueue.length && filteredQueue.length > 0}
                                                />
                                            </th>
                                            <th className="px-6 py-3">Claim ID</th>
                                            <th className="px-6 py-3">Claimant</th>
                                            <th className="px-6 py-3">Village</th>
                                            <th className="px-6 py-3">Land Size (ha)</th>
                                            <th className="px-6 py-3">Veracity Score</th>
                                            <th className="px-6 py-3">Verified By</th>
                                            <th className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : filteredQueue.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="p-12 text-center text-slate-500">
                                                    No pending claims found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredQueue.map((claim) => (
                                                <tr key={claim._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 text-primary focus:ring-primary"
                                                            checked={selectedClaims.includes(claim._id)}
                                                            onChange={() => toggleSelectClaim(claim._id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                                        #{claim._id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {claim.claimantName}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                        {claim.village}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                        {claim.landSizeClaimed || claim.boundaryArea || '0'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500 w-[92%]"></div>
                                                            </div>
                                                            <span className="font-bold text-green-600 text-xs">92%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                                        SDLC Officer
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <Link href={`/claims/${claim._id}`}>
                                                                <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                            </Link>
                                                            <button className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                                                <ThumbsUp className="w-5 h-5" />
                                                            </button>
                                                            <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                                                <ThumbsDown className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Showing {filteredQueue.length} of {approvalQueue.length} entries
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
            </DashboardLayout>
        </RoleGuard>
    );
}
