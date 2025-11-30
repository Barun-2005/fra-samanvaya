import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function VerificationDashboard() {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({ pending: 0, todayVerified: 0, totalVerified: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            // Handle both new paginated structure and potential array response
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            // Filter for submitted claims that need verification
            const submitted = claimsArray.filter(c => c.status === 'Submitted');
            setQueue(submitted);
            setStats({ pending: submitted.length, todayVerified: 5, totalVerified: 124 });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        Verification Dashboard ✅
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Review and verify forest rights claims
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border-2 border-yellow-500 rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Pending Verification</div>
                        <div className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground mt-2">Awaiting your review</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Verified Today</div>
                        <div className="text-4xl font-bold text-foreground mt-2">{stats.todayVerified}</div>
                        <div className="text-sm text-muted-foreground mt-2">Great progress!</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Total Verified</div>
                        <div className="text-4xl font-bold text-foreground mt-2">{stats.totalVerified}</div>
                        <div className="text-sm text-muted-foreground mt-2">All time</div>
                    </div>
                </div>

                {/* Verification Queue */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Verification Queue ({queue.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-foreground font-semibold text-lg">All Caught Up!</p>
                            <p className="text-muted-foreground mt-2">No claims pending verification</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Claim ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Claimant</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Village</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Land Size</th>
                                        <th className="text-left py-3 px-4 font-semibold text-foreground">Submitted</th>
                                        <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.map((claim) => (
                                        <tr key={claim._id} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium text-foreground">#{claim._id.slice(-6)}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.claimantName || 'N/A'}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.village || 'N/A'}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.landSizeClaimed || claim.boundaryArea || 'N/A'} ha</td>
                                            <td className="py-3 px-4 text-muted-foreground text-sm">
                                                {claim.dateSubmitted ? new Date(claim.dateSubmitted).toLocaleDateString() : 'Recent'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/claims/${claim._id}`}>
                                                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                                        Review →
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
