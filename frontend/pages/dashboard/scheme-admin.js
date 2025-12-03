import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAuth } from '../../src/context/AuthContext';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import api from '../../src/lib/api';
import SchemeRecommendations from '../../src/components/Dashboard/SchemeRecommendations';
import PolicyMatcherPanel from '../../src/components/Dashboard/PolicyMatcherPanel';
import {
    BarChart2,
    PieChart,
    Users,
    FileText,
    Settings,
    Plus,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MapIcon
} from 'lucide-react';

// Dynamic import for AtlasMap (avoid SSR issues)
const AtlasMap = dynamic(() => import('../../src/components/Atlas/AtlasMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
});

// Dynamic import for SmartSchemeBuilder to avoid SSR issues if any
const SmartSchemeBuilder = dynamic(() => import('../../src/components/Schemes/SmartSchemeBuilder'), {
    ssr: false
});

// Dynamic import for ImpactAnalytics
const ImpactAnalytics = dynamic(() => import('../../src/components/Dashboard/ImpactAnalytics'), {
    ssr: false
});

// Dynamic import for PolicySimulator
const PolicySimulator = dynamic(() => import('../../src/components/Schemes/PolicySimulator'), {
    ssr: false
});

// Add Scheme Modal Component
function AddSchemeModal({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Agriculture',
        budget: '',
        beneficiaries: '',
        status: 'Active',
        rules: []
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const api = require('../../src/lib/api').default;
            await api.post('/schemes', formData);
            onAdd();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to add scheme');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Scheme</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Scheme Name</label>
                            <input
                                required
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                            <select
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Agriculture">Agriculture</option>
                                <option value="Housing">Housing</option>
                                <option value="Education">Education</option>
                                <option value="Health">Health</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            required
                            className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white min-h-[80px]"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Smart Rules Builder */}
                    <SmartSchemeBuilder
                        value={formData.rules}
                        onChange={(rules) => setFormData({ ...formData, rules })}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                            <select
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Budget (₹)</label>
                            <input
                                required
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                                value={formData.budget}
                                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Beneficiaries</label>
                            <input
                                type="number"
                                required
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                                value={formData.beneficiaries}
                                onChange={e => setFormData({ ...formData, beneficiaries: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50 font-bold"
                        >
                            {loading ? 'Adding...' : 'Create Smart Scheme'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SchemeAdminDashboard() {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [stats, setStats] = useState({ totalClaims: 0, eligibleClaims: 0, schemesActive: 12 });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [claimsRes, schemesRes] = await Promise.all([
                api.get('/claims'),
                api.get('/schemes')
            ]);

            const claims = claimsRes.data.data || claimsRes.data || [];
            const schemesList = schemesRes.data.schemes || [];

            setSchemes(schemesList);

            setStats({
                totalClaims: claims.length,
                eligibleClaims: claims.filter(c => c.status === 'Approved').length,
                schemesActive: schemesList.filter(s => s.status === 'Active').length
            });

        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RoleGuard allowedRoles={['Scheme Admin', 'Super Admin']}>
            <DashboardLayout>
                <Head>
                    <title>Scheme Administration | FRA Samanvay</title>
                </Head>

                <div className="p-4 lg:p-8 min-h-screen">
                    <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Scheme Administration
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Manage government schemes and analyze performance.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Scheme
                            </button>
                        </div>

                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Total Claims</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClaims}</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> +5.4%
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Eligible Beneficiaries</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.eligibleClaims}</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                        <PieChart className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        Active Schemes
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Active Schemes</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.schemesActive}</p>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="space-y-8">
                            {/* Impact Analytics */}
                            <ImpactAnalytics schemes={schemes} />

                            {/* Regional Budget Planner with GIS */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapIcon className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Regional Budget Planner (GIS Atlas)</h2>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Draw a region on the map to analyze claim distribution and estimate budget requirements for schemes.
                                </p>
                                <AtlasMap />
                            </div>

                            {/* Policy Simulator Section */}
                            <PolicySimulator />

                            {/* Scheme Analysis */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Beneficiary Scheme Analysis</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Analyze specific beneficiary data to recommend suitable government schemes.
                                </p>
                                <SchemeRecommendations
                                    claimantId="admin-view"
                                    village="All Villages"
                                />
                            </div>

                            {/* Scheme List */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Schemes</h2>
                                    <button className="text-primary font-bold text-sm hover:underline">View All</button>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {schemes.map((scheme) => (
                                        <div key={scheme.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold text-lg">
                                                    {scheme.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{scheme.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Budget: {scheme.budget} • {scheme.beneficiaries.toLocaleString()} Beneficiaries
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${scheme.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {scheme.status}
                                                </span>
                                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showAddModal && (
                    <AddSchemeModal
                        onClose={() => setShowAddModal(false)}
                        onAdd={fetchData}
                    />
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
