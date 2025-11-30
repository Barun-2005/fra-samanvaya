import ActionCard from '../ActionCard';

export default function DashboardNGOViewer({ user, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ActionCard
                title="Data Export"
                description="Download claims data in CSV or Excel format for analysis."
                href="/export"
                linkText="Download Data"
            />
             <ActionCard
                title="Summary Stats"
                description="View aggregated claim statistics by district or village."
            >
                {/* Child for a small chart */}
            </ActionCard>
            <ActionCard
                title="Recent Exports"
                description="A list of your recently generated data exports."
            />
        </div>
    );
}
