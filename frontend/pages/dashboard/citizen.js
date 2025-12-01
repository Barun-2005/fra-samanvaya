import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import { Plus, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [claims, setClaims] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user's claims
            const claimsResponse = await api.get('/claims?limit=5');
            setClaims(claimsResponse.data.data || claimsResponse.data || []);

            // Fetch scheme recommendations (if endpoint exists)
            try {
                const schemesResponse = await api.get('/schemes/recommend');
                setSchemes(schemesResponse.data.schemes || []);
            } catch (err) {
                // Schemes endpoint may not exist yet, use fallback
                setSchemes([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const latestStatus = claims.length > 0 ? claims[0].status : 'No Claims';

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user?.fullName?.split(' ')[0] || 'Citizen'}!</h1>
                        <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
                            Manage your Forest Rights Act (FRA) claims and discover relevant schemes.
                        </p>
                    </div>
                    <Link href="/create-claim">
                        <button className="bg-primary hover:bg-primary-hover focus:ring-4 focus:ring-primary-focus/50 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus className="w-5 h-5" />
                            Submit New Claim
                        </button>
                    </Link>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                        <p className="text-text-light-secondary dark:text-dark-secondary">My Claims</p>
                        <p className="text-4xl font-bold mt-2">{claims.length}</p>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                        <p className="text-text-light-secondary dark:text-dark-secondary">Latest Status</p>
                        <p className="text-4xl font-bold mt-2">{latestStatus}</p>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                        <p className="text-text-light-secondary dark:text-dark-secondary">Schemes For You</p>
                        <p className="text-4xl font-bold mt-2">{schemes.length}</p>
                    </div>
                </div>

                {/* Recommended Schemes Section */}
                {schemes.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Recommended Schemes for You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {schemes.slice(0, 4).map((scheme, index) => (
                                <div
                                    key={index}
                                    className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark shadow-sm flex items-center p-4 gap-4"
                                >
                                    <img
                                        alt={scheme.name || 'Scheme image'}
                                        className="w-24 h-24 object-cover rounded"
                                        src={
                                            index % 2 === 0
                                                ? 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop'
                                                : 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&h=200&fit=crop'
                                        }
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                                            {scheme.category || 'Agriculture Scheme'}
                                        </p>
                                        <h3 className="font-semibold text-lg">{scheme.name}</h3>
                                        <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1 line-clamp-2">
                                            {scheme.description || 'An insurance service for farmers for their yields.'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2.5 py-1 rounded-full">
                                                Eligible
                                            </span>
                                            <button className="ml-auto bg-primary/10 text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center gap-1">
                                                Learn More
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Claims Table */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">My Recent Claims</h2>

                    {loading ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark shadow-sm p-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-text-light-secondary dark:text-dark-secondary">Loading claims...</p>
                            </div>
                        </div>
                    ) : claims.length === 0 ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark shadow-sm p-12">
                            <div className="text-center">
                                <p className="font-semibold mb-2">No claims yet</p>
                                <p className="text-text-light-secondary dark:text-dark-secondary text-sm mb-6">
                                    Start by submitting your first claim
                                </p>
                                <Link href="/create-claim">
                                    <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                                        Submit First Claim
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                            <table className="w-full text-left">
                                <thead className="border-b border-border-light dark:border-border-dark">
                                    <tr>
                                        <th className="p-4 font-semibold text-sm text-text-light-secondary dark:text-dark-secondary">CLAIM ID</th>
                                        <th className="p-4 font-semibold text-sm text-text-light-secondary dark:text-dark-secondary">DATE SUBMITTED</th>
                                        <th className="p-4 font-semibold text-sm text-text-light-secondary dark:text-dark-secondary">LOCATION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {claims.map((claim) => (
                                        <tr
                                            key={claim._id}
                                            className="border-b border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                            onClick={() => window.location.href = `/claims/${claim._id}`}
                                        >
                                            <td className="p-4 font-medium">
                                                FRA-{claim._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="p-4 text-text-light-secondary dark:text-dark-secondary">
                                                {claim.createdAt
                                                    ? new Date(claim.createdAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td className="p-4 text-text-light-secondary dark:text-dark-secondary">
                                                {claim.village || 'N/A'}, {claim.district || 'Unknown'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
