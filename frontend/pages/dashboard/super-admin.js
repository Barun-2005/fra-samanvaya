import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import UserManagementTable from '../../src/components/Admin/UserManagementTable';
import api from '../../src/lib/api';
import {
    Activity,
    Users,
    Server,
    AlertTriangle,
    Shield
} from 'lucide-react';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [systemHealth, setSystemHealth] = useState({ status: 'Operational', uptime: '99.9%', latency: '85ms' });
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeOfficers: 0
    });
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch user stats
            const usersRes = await api.get('/users');
            const users = usersRes.data;
            setStats({
                totalUsers: users.length,
                activeOfficers: users.filter(u => u.role !== 'Citizen' && u.status === 'Active').length
            });

            // Fetch anomalies
            try {
                const anomaliesRes = await api.get('/admin/anomalies');
                setAnomalies(anomaliesRes.data || []);
            } catch (err) {
                console.error('Anomaly detection not available:', err);
                setAnomalies([]);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RoleGuard allowedRoles={['Super Admin']}>
            <DashboardLayout>
                <Head>
                    <title>Super Admin Dashboard | FRA Samanvay</title>
                </Head>

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Super Admin Console
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    System Management & User Administration
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <Shield className="w-5 h-5" />
                                    Security Logs
                                </button>
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                                    <Users className="w-5 h-5" />
                                    Add User
                                </button>
                            </div>
                        </div>

                        {/* System Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="text-sm text-slate-500 dark:text-slate-400">Total Users</div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalUsers}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="text-sm text-slate-500 dark:text-slate-400">Active Officers</div>
                                <div className="text-3xl font-bold text-blue-600 mt-2">{stats.activeOfficers}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="text-sm text-slate-500 dark:text-slate-400">System Health</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">{systemHealth.status}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="text-sm text-slate-500 dark:text-slate-400">API Latency</div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{systemHealth.latency}</div>
                            </div>
                        </div>

                        {/* Anomaly Detection Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anomaly Detection (God's Eye)</h2>
                                {anomalies.length > 0 && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                                        {anomalies.length} Issues
                                    </span>
                                )}
                            </div>

                            {anomalies.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    No anomalies detected. System is healthy. ✅
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {anomalies.map((anomaly, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-red-50/50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30 rounded-lg">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                            <div>
                                                <h4 className="font-bold text-red-900 dark:text-red-400">{anomaly.type.replace('_', ' ')}</h4>
                                                <p className="text-red-800 dark:text-red-300 text-sm">{anomaly.message}</p>
                                                <p className="text-red-600/70 text-xs mt-1">{new Date(anomaly.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Management Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Add, edit, or deactivate system users.</p>
                                </div>
                            </div>
                            <UserManagementTable />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
