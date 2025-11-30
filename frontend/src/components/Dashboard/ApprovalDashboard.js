import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function ApprovalDashboard() {
    const { user } = useAuth();
    const [approvalQueue, setApprovalQueue] = useState([]);
    const [highRisk, setHighRisk] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            // Handle both new paginated structure and potential array response
            const claims = response.data.data || response.data;
            const claimsArray = Array.isArray(claims) ? claims : [];

            // Filter for verified claims awaiting approval
            const verified = claimsArray.filter(c => c.status === 'Verified');
            setApprovalQueue(verified);
            // Mock high-risk claims (low veracity score in real app)
            setHighRisk(verified.slice(0, 2));
            setStats({ pending: verified.length, approved: 89, rejected: 12 });
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
                        Approval Dashboard 👔
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Final approval decisions for forest rights claims
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border-2 border-yellow-500 rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Pending Approval</div>
                        <div className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground mt-2">Awaiting decision</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Approved This Month</div>
                        <div className="text-4xl font-bold text-green-600 mt-2">{stats.approved}</div>
                        <div className="text-sm text-muted-foreground mt-2">Success rate: {Math.round(stats.approved / (stats.approved + stats.rejected) * 100)}%</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Rejected This Month</div>
                        <div className="text-4xl font-bold text-red-600 mt-2">{stats.rejected}</div>
                        <div className="text-sm text-muted-foreground mt-2">Requires attention</div>
                    </div>
                </div>

                {/* High Risk Alert */}
                {highRisk.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-900 dark:text-red-100 text-lg">High-Risk Claims Detected</h3>
                                <p className="text-red-800 dark:text-red-200 mt-1">{highRisk.length} claims require extra attention based on AI analysis</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Queue */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Approval Queue ({approvalQueue.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : approvalQueue.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-foreground font-semibold text-lg">All Caught Up!</p>
                            <p className="text-muted-foreground mt-2">No claims pending approval</p>
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
                                        <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvalQueue.map((claim) => (
                                        <tr key={claim._id} className="border-b border-border hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium text-foreground">#{claim._id.slice(-6)}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.claimantName || 'N/A'}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.village || 'N/A'}</td>
                                            <td className="py-3 px-4 text-foreground">{claim.landSizeClaimed || claim.boundaryArea || 'N/A'} ha</td>
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
