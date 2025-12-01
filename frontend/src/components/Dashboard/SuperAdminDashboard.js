import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagementTable from '../Admin/UserManagementTable';
import api from '../../lib/api';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeOfficers: 0,
        systemHealth: 'Healthy',
        apiLatency: '45ms'
    });
    const [anomalies, setAnomalies] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchAnomalies();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/users');
            const users = response.data;
            setStats(prev => ({
                ...prev,
                totalUsers: users.length,
                activeOfficers: users.filter(u => u.role !== 'Citizen' && u.status === 'Active').length
            }));
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const fetchAnomalies = async () => {
        try {
            const response = await api.get('/admin/anomalies');
            setAnomalies(response.data);
        } catch (err) {
            console.error("Failed to fetch anomalies", err);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Super Admin Console 🛡️</h1>
                    <p className="text-muted-foreground mt-2">System Management & User Administration</p>
                </div>

                {/* System Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Total Users</div>
                        <div className="text-3xl font-bold text-foreground mt-2">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">Active Officers</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">{stats.activeOfficers}</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">System Health</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">{stats.systemHealth}</div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-sm text-muted-foreground">API Latency</div>
                        <div className="text-3xl font-bold text-foreground mt-2">{stats.apiLatency}</div>
                    </div>
                </div>

                {/* Anomaly Detection Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-semibold text-foreground">👁️ God's Eye (Anomaly Detection)</h2>
                        {anomalies.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                                {anomalies.length} Issues Found
                            </span>
                        )}
                    </div>

                    {anomalies.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                            No anomalies detected. System is healthy. ✅
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.map((anomaly, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 bg-red-50/50 border border-red-100 rounded-lg">
                                    <div className="text-2xl">🚨</div>
                                    <div>
                                        <h4 className="font-bold text-red-900">{anomaly.type.replace('_', ' ')}</h4>
                                        <p className="text-red-800 text-sm">{anomaly.message}</p>
                                        <p className="text-red-600/70 text-xs mt-1">{new Date(anomaly.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Management Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">User Management</h2>
                            <p className="text-muted-foreground text-sm">Add, edit, or deactivate system users.</p>
                        </div>
                    </div>
                    <UserManagementTable />
                </div>
            </div>
        </div>
    );
}
