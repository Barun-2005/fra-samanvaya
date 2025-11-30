import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import DashboardLayout from '../Layout/DashboardLayout';
import SchemeRecommendations from './SchemeRecommendations';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyClaims();
    }, []);

    const fetchMyClaims = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims?limit=5');
            // New API returns { data, pagination }
            const claims = response.data.data || response.data;
            setMyClaims(claims);
        } catch (err) {
            console.error('Error fetching claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome, {user?.fullName || 'Citizen'}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Track your forest rights claims and get scheme recommendations.
                        </p>
                    </div>

                    {/* Scheme Recommendations */}
                    <div className="mb-8">
                        <SchemeRecommendations
                            claimantId={user?._id}
                            village={user?.village || 'Unknown'}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Submit New Claim */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary/10 rounded-lg">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground">Submit New Claim</h3>
                                    <p className="text-sm text-muted-foreground">Apply for forest land rights</p>
                                </div>
                            </div>
                            <Link href="/create-claim">
                                <button className="mt-4 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                    Start Application
                                </button>
                            </Link>
                        </div>

                        {/* View All Claims */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-secondary/10 rounded-lg">
                                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground">View All Claims</h3>
                                    <p className="text-sm text-muted-foreground">See the status of all your applications</p>
                                </div>
                            </div>
                            <Link href="/claims">
                                <button className="mt-4 w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
                                    View All Claims
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Claims */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">My Recent Claims</h2>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground mt-2">Loading claims...</p>
                            </div>
                        ) : myClaims.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-foreground font-medium">No claims yet</p>
                                <p className="text-muted-foreground text-sm mt-1">Start by submitting your first claim</p>
                                <Link href="/create-claim">
                                    <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90">
                                        Submit First Claim
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Claim ID</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Village</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Land Size</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myClaims.map((claim) => (
                                            <tr key={claim._id} className="border-b border-border hover:bg-muted/50">
                                                <td className="py-3 px-4 text-foreground font-medium">{claim.claimId || claim._id.slice(-6)}</td>
                                                <td className="py-3 px-4 text-foreground">{claim.village || 'N/A'}</td>
                                                <td className="py-3 px-4 text-foreground">{claim.landSizeClaimed || claim.boundaryArea || 'N/A'} ha</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                                        {claim.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground text-sm">
                                                    {claim.dateSubmitted ? new Date(claim.dateSubmitted).toLocaleDateString() : 'Recent'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link href={`/claims/${claim._id}`}>
                                                        <button className="text-primary hover:underline font-medium text-sm">
                                                            View Details
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

                    {/* Status Legend */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-3">Claim Status Guide</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Submitted</span>
                                <span className="text-sm text-muted-foreground">Under review</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Verified</span>
                                <span className="text-sm text-muted-foreground">Awaiting approval</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                                <span className="text-sm text-muted-foreground">Claim accepted</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>
                                <span className="text-sm text-muted-foreground">Claim denied</span>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
                        <p className="text-muted-foreground mb-4">
                            If you have questions about the claims process or need assistance, we're here to help.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-card border border-border rounded-lg font-medium hover:bg-muted transition-colors">
                                📞 Contact Support
                            </button>
                            <button className="px-4 py-2 bg-card border border-border rounded-lg font-medium hover:bg-muted transition-colors">
                                ❓ View FAQs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
