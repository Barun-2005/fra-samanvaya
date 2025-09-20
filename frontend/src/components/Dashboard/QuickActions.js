import PropTypes from 'prop-types';
import Link from 'next/link';

const ActionButton = ({ href, children, className = '' }) => (
  <Link href={href} className={`block text-center mt-4 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors ${className}`}>
      {children}
  </Link>
);

const ActionCard = ({ title, description, href, linkText, value, unit }) => (
    <div className="bg-card p-6 rounded-2xl shadow-soft flex flex-col">
        <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
        {description && <p className="text-muted-foreground mt-1 flex-1">{description}</p>}
        {value !== undefined && (
             <div className="flex items-baseline mt-4">
                <span className="text-4xl font-bold text-primary">{value}</span>
                {unit && <span className="ml-2 text-muted-foreground">{unit}</span>}
            </div>
        )}
        {href && linkText && <ActionButton href={href}>{linkText}</ActionButton>}
    </div>
);

export default function QuickActions({ roles, stats }) {
  const hasRole = (role) => roles.includes(role);

  return (
    <div className="bg-card p-6 rounded-2xl shadow-soft">
        <h3 className="text-xl font-bold text-card-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* DataEntry specific */}
            {hasRole('DataEntry') && (
                <ActionCard 
                    title="New Claim"
                    description="Start a new claim submission for an individual or a community."
                    href="/create-claim"
                    linkText="Start New Claim"
                />
            )}

            {/* VerificationOfficer specific */}
            {hasRole('Verifier') && (
                <ActionCard 
                    title="Verification Queue"
                    value={stats?.underVerification || 0}
                    unit="claims"
                    href="/verification-queue"
                    linkText="View Queue"
                />
            )}
             {hasRole('Verifier') && (
                <ActionCard 
                    title="Map Verification"
                    description="Verify multiple claims in a geographical area."
                    href="/atlas"
                    linkText="Open Atlas"
                />
            )}

            {/* ApprovingAuthority specific */}
            {hasRole('Approver') && (
                 <ActionCard 
                    title="Approval Console"
                    value={stats?.pending || 0}
                    unit="claims waiting"
                    href="/approval"
                    linkText="Open Console"
                />
            )}

            {/* SchemeAdmin specific */}
            {hasRole('SchemeAdmin') && (
                <ActionCard 
                    title="Scheme Admin"
                    description="Manage and configure government schemes."
                    href="/schemes"
                    linkText="Manage Schemes"
                />
            )}

            {/* SuperAdmin specific */}
            {hasRole('SuperAdmin') && (
                <>
                    <ActionCard 
                        title="User Management"
                        description="Add, edit, or remove system users and assign roles."
                        href="/users"
                        linkText="Manage Users"
                    />
                    <ActionCard 
                        title="System Config"
                        description="Configure system-level settings and parameters."
                        href="/config"
                        linkText="Configure System"
                    />
                </>
            )}

             {/* ReadonlyViewer specific */}
            {hasRole('NGOViewer') && (
                <ActionCard 
                    title="Download Data"
                    description="Access and download claim and scheme data."
                    href="/viewer"
                    linkText="Open Data Viewer"
                />
            )}
        </div>
    </div>
  );
}

QuickActions.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  stats: PropTypes.object,
};
