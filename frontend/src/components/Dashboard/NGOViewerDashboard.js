import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../Layout/DashboardLayout';

export default function NGOViewerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalClaims: 0, pending: 0, approved: 0 });
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
                pending: claimsArray.filter(c => c.status === 'Submitted').length,
                approved: claimsArray.filter(c => c.status === 'Approved').length
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
                        <h1 className="text-3xl font-bold text-foreground">NGO Overview 🌍</h1>
                        <p className="text-muted-foreground mt-2">Monitor implementation of Forest Rights Act</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Total Applications</div>
                            <div className="text-4xl font-bold text-foreground mt-2">{stats.totalClaims}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Pending Review</div>
                            <div className="text-4xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="text-sm text-muted-foreground">Approved Claims</div>
                            <div className="text-4xl font-bold text-green-600 mt-2">{stats.approved}</div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-foreground">Public Claims Registry</h2>
                            <Link href="/claims">
                                <button className="text-primary hover:underline font-medium">View All Claims →</button>
                            </Link>
                        </div>
                        <p className="text-muted-foreground">Access transparent data about forest rights claims processing.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
