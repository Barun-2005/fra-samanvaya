import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../Layout/DashboardLayout';
import SchemeRecommendations from './SchemeRecommendations';

export default function SchemeAdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalClaims: 0, eligibleClaims: 0, schemesActive: 0 });
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
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Scheme Administration 📊</h1>
                        <p className="text-muted-foreground mt-2">Manage and monitor government scheme distribution</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Total Claims</div>
                            <div className="text-4xl font-bold text-foreground mt-2">{stats.totalClaims}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Eligible Beneficiaries</div>
                            <div className="text-4xl font-bold text-green-600 mt-2">{stats.eligibleClaims}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Active Schemes</div>
                            <div className="text-4xl font-bold text-blue-600 mt-2">{stats.schemesActive}</div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Scheme Recommendations Engine</h2>
                        <p className="text-muted-foreground mb-4">
                            Analyze beneficiary data to recommend suitable government schemes.
                        </p>
                        <SchemeRecommendations
                            claimantId="admin-view"
                            village="All Villages"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
