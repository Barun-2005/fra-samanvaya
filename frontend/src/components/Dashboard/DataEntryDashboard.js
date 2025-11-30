import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function DataEntryDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ today: 0, week: 0, month: 0 });
    const [recentClaims, setRecentClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims?limit=5&sort=latest');
            // Handle both new paginated structure and potential array response
            const claims = response.data.data || response.data;
            setRecentClaims(Array.isArray(claims) ? claims : []);
            // Mock stats for now
            setStats({ today: 3, week: 12, month: 45 });
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
                        Data Entry Dashboard 📝
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Quick claim creation and entry management
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">Today's Entries</div>
                        <div className="text-4xl font-bold mt-2">{stats.today}</div>
                        <div className="text-sm opacity-75 mt-2">Claims entered today</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">This Week</div>
                        <div className="text-4xl font-bold mt-2">{stats.week}</div>
                        <div className="text-sm opacity-75 mt-2">7-day total</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">This Month</div>
                        <div className="text-4xl font-bold mt-2">{stats.month}</div>
                        <div className="text-sm opacity-75 mt-2">Monthly progress</div>
                    </div>
                </div>

                {/* Quick Action - Create Claim */}
                <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Enter a New Claim?</h2>
                            <p className="opacity-90">Use OCR, voice input, or manual entry for fast data processing</p>
                        </div>
                        <Link href="/create-claim">
                            <button className="px-8 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                                ➕ Create Claim
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Recent Claims */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Recent Entries</h2>
                        <Link href="/claims">
                            <button className="text-primary hover:underline font-medium">View All →</button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : recentClaims.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No claims entered yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentClaims.map((claim) => (
                                <div key={claim._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">{claim.claimantName || 'Claim #' + claim._id.slice(-6)}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {claim.village || 'N/A'} • {claim.landSizeClaimed || claim.boundaryArea || 'N/A'} ha
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {claim.status}
                                        </span>
                                        <Link href={`/claims/${claim._id}`}>
                                            <button className="text-primary hover:underline font-medium">View</button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
