import ActionCard from '../ActionCard';

export default function DashboardSchemeAdmin({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ActionCard
                title="Manage Schemes"
                description="Create, edit, and manage government schemes and their eligibility criteria."
                href="/schemes"
                linkText="Manage Schemes"
            />
             <ActionCard
                title="Active Schemes"
                value={stats?.activeSchemes || 0} // Placeholder
                unit="schemes"
            />
            <ActionCard
                title="Latest Beneficiaries"
                value={stats?.beneficiaries || 0} // Placeholder
                unit="this month"
            />
        </div>
    );
}
