import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import FieldVisitMode from '../../src/components/Claims/FieldVisitMode';
import {
    CheckCircle,
    Clock,
    MapPin,
    AlertTriangle,
    FileText,
    Search,
    Filter,
    Navigation,
    RefreshCw,
    ChevronRight,
    MoreVertical
} from 'lucide-react';

export default function VerificationDashboard() {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({ pending: 0, todayVerified: 0, totalVerified: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFieldVisitClaim, setActiveFieldVisitClaim] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            // Filter for submitted claims that need verification
            const submitted = claimsArray.filter(c => c.status === 'Submitted');
            setQueue(submitted);

            // Calculate real stats
            const stats = {
                pending: submitted.length,
                todayVerified: claimsArray.filter(c => c.status === 'Verified' && new Date(c.verifiedAt).toDateString() === new Date().toDateString()).length,
                totalVerified: claimsArray.filter(c => c.status === 'Verified').length
            };
            setStats(stats);

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredQueue = queue.filter(claim =>
        claim.claimantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.village?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Alerts
    const lowVeracityClaims = queue.filter(c => (c.veracityScore || 0) < 50).length;
    const highPriorityClaims = queue.length;

    return (
        <RoleGuard allowedRoles={['Verification Officer']}>
            <DashboardLayout>
                <Head>
                    <title>Verification Dashboard | FRA Samanvay</title>
                </Head>

                <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 min-h-[calc(100vh-64px)] pb-24 lg:pb-8">
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                                    Field Verification
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Manage and verify claims on the ground.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchQueue}
                                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                    <FileText className="w-4 h-4" />
                                    Export Report
                                </button>
                            </div>
                        </div>

                        {/* Mobile Stats Carousel (Horizontal Scroll) */}
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
                            <div className="min-w-[240px] bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</div>
                                <div className="text-xs text-slate-500 mt-1">Claims to visit</div>
                            </div>

                            <div className="min-w-[240px] bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Verified Today</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.todayVerified}</div>
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <span className="font-bold">+2</span> from yesterday
                                </div>
                            </div>

                            <div className="min-w-[240px] bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Verified</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalVerified}</div>
                                <div className="text-xs text-slate-500 mt-1">All time</div>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search by Name, ID, or Village..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white p-0 min-w-0"
                                />
                            </div>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                        </div>

                        {/* Verification Queue List (Mobile-Optimized Cards) */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white px-1">
                                Verification Queue ({filteredQueue.length})
                            </h2>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredQueue.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">All Caught Up!</h3>
                                    <p className="text-slate-500 dark:text-slate-400">No pending claims to verify.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                                    {filteredQueue.map((claim) => (
                                        <div key={claim._id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                            #{claim._id.slice(-6).toUpperCase()}
                                                        </span>
                                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                            Pending
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                                        {claim.claimantName}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {claim.village}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                        {claim.landSizeClaimed || claim.boundaryArea || '0'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">Hectares</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex-1">
                                                    <div className="text-xs text-slate-500 mb-1">Veracity Score</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full w-[${claim.veracityScore || 0}%] rounded-full ${(claim.veracityScore || 0) > 70 ? 'bg-green-500' :
                                                                        (claim.veracityScore || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${claim.veracityScore || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${(claim.veracityScore || 0) > 70 ? 'text-green-600' :
                                                                (claim.veracityScore || 0) > 40 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>{claim.veracityScore || 0}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setActiveFieldVisitClaim(claim)}
                                                        className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                                        title="Field Visit Mode"
                                                    >
                                                        <Navigation className="w-5 h-5" />
                                                    </button>
                                                    <Link href={`/claims/${claim._id}`}>
                                                        <button className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Insights Sidebar (Desktop Only) */}
                    <div className="hidden lg:flex w-80 flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Priority Alerts
                            </h3>
                            <div className="space-y-3">
                                {lowVeracityClaims > 0 && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Low Veracity Claims</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {lowVeracityClaims} claims have a low AI veracity score. Please investigate thoroughly.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {highPriorityClaims > 0 && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Pending Verification</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {highPriorityClaims} claims are awaiting field verification.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {lowVeracityClaims === 0 && highPriorityClaims === 0 && (
                                    <p className="text-sm text-slate-500">No active alerts.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Action Bar (Thumb Mode) */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 pb-safe">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (queue.length > 0) setActiveFieldVisitClaim(queue[0]);
                            }}
                            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                        >
                            <Navigation className="w-6 h-6" />
                            <span className="text-xs">Start Field Visit</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold active:scale-95 transition-transform">
                            <RefreshCw className="w-6 h-6" />
                            <span className="text-xs">Sync Offline</span>
                        </button>
                    </div>
                </div>

                {/* Field Visit Modal */}
                {activeFieldVisitClaim && (
                    <FieldVisitMode
                        claim={activeFieldVisitClaim}
                        onClose={() => setActiveFieldVisitClaim(null)}
                        onUpdate={fetchQueue}
                    />
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
