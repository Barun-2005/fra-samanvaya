import PropTypes from 'prop-types';
import Link from 'next/link';
import {format} from 'date-fns';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Under Verification': 'bg-blue-100 text-blue-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

export default function RecentClaimsTable({ claims }) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-soft">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-card-foreground">Recent Claims</h3>
        <Link href="/claims" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 font-semibold text-muted-foreground">Claimant Name</th>
              <th className="p-4 font-semibold text-muted-foreground">Claim Type</th>
              <th className="p-4 font-semibold text-muted-foreground">Area (acres)</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground">Last Updated</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(!claims || claims.length === 0) ? (
                <tr><td colSpan="6" className="text-center p-8 text-muted-foreground">No recent claims found.</td></tr>
            ) : (
                claims.map(claim => (
                <tr key={claim._id} className="border-b border-border last:border-0 hover:bg-muted">
                    <td className="p-4 font-medium">{claim.claimantName || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{claim.claimType || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{claim.area || 'N/A'}</td>
                    <td className="p-4"><StatusBadge status={claim.status} /></td>
                    <td className="p-4 text-muted-foreground">{format(new Date(claim.updatedAt), 'dd MMM yyyy')}</td>
                    <td className="p-4">
                        <Link href={`/claim/${claim._id}`} className="font-semibold text-primary hover:underline">
                            View
                        </Link>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

RecentClaimsTable.propTypes = {
  claims: PropTypes.array,
};
