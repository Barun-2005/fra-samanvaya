import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ImpactAnalytics({ schemes }) {
    // Mock data generation based on schemes
    // In a real app, this would come from an aggregation pipeline
    const data = schemes.map(scheme => ({
        name: scheme.name.length > 15 ? scheme.name.substring(0, 15) + '...' : scheme.name,
        Eligible: Math.floor(Math.random() * 5000) + 1000, // Mock eligible count
        Enrolled: scheme.beneficiaries || 0,
        Gap: (Math.floor(Math.random() * 5000) + 1000) - (scheme.beneficiaries || 0)
    }));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Impact & Gap Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Compare eligible population vs. actual enrollment to identify coverage gaps.
                    </p>
                </div>
                <select className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                    <option>All Districts</option>
                    <option>District A</option>
                    <option>District B</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="Eligible" fill="#94a3b8" name="Total Eligible (Est.)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Enrolled" fill="#10b981" name="Actually Enrolled" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div className="text-sm text-red-600 dark:text-red-400 font-bold mb-1">Critical Gap</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">12,450</div>
                    <div className="text-xs text-slate-500">Unserved eligible citizens</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">Coverage Rate</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">68%</div>
                    <div className="text-xs text-slate-500">Average across schemes</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                    <div className="text-sm text-green-600 dark:text-green-400 font-bold mb-1">Efficiency</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">High</div>
                    <div className="text-xs text-slate-500">Resource utilization</div>
                </div>
            </div>
        </div>
    );
}
