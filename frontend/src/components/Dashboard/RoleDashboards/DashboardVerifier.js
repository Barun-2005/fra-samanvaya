import ActionCard from '../ActionCard';

export default function DashboardVerifier({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ActionCard
                title="Pending Verification"
                description="Claims assigned to you that are awaiting your review."
                value={stats?.underVerification || 0}
                unit="claims"
                href="/verification-queue"
                linkText="Open Verification Queue"
            />
             <ActionCard
                title="Flagged Claims"
                description="Claims that have been flagged for discrepancies or issues."
                value={stats?.flagged || 0} // Assuming a 'flagged' stat
                unit="claims"
            />
            <ActionCard
                title="Map-Based Verification"
                description="View and verify claims geographically."
                href="/atlas"
                linkText="Open Atlas"
            />
        </div>
    );
}
