import ActionCard from '../ActionCard';

export default function DashboardSuperAdmin({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ActionCard
                title="User Management"
                description="Create, edit, and manage system users and their roles."
                href="/users"
                linkText="Manage Users"
            />
             <ActionCard
                title="System Configuration"
                description="Manage system-wide settings and application parameters."
                href="/config"
                linkText="Configure"
            />
            <ActionCard
                title="Recent Activity"
                description="View the latest audit log of important system events."
                href="/audit-log"
                linkText="View Audit Log"
            />
        </div>
    );
}
