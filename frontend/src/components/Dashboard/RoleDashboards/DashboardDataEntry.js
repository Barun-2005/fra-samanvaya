import ActionCard from '../ActionCard';

export default function DashboardDataEntry({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 xl:col-span-1">
                 <ActionCard 
                    title="New Claim"
                    description="Start a new claim submission for an individual or a community."
                    href="/create-claim"
                    linkText="Start New Claim"
                />
            </div>
            <ActionCard
                title="Pending Verifications"
                value={stats?.pending || 0}
                unit="claims"
            />
            <ActionCard
                title="My Submissions"
                value={stats?.total || 0}
                unit="claims"
            />
        </div>
    );
}
