// Approving Authority Dashboard
import ActionCard from '../ActionCard';

export default function DashboardApprover({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ActionCard
                title="Awaiting Approval"
                description="Verified claims that require your final approval or rejection."
                value={stats?.pending || 0}
                unit="claims"
                href="/approval-console"
                linkText="Open Approval Console"
            />
             <ActionCard
                title="Flagged Claims"
                description="Claims flagged during verification that need special attention."
                value={stats?.flagged || 0}
                unit="claims"
            />
            <ActionCard
                title="District Summary"
                description="Claims approved vs. rejected in your district this month."
                // Children can be used for a small chart in the future
            />
        </div>
    );
}
