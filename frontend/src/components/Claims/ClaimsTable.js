import Link from 'next/link';

const ClaimsTable = ({ claims, onGeoIconClick }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-success-light/10 text-success-light dark:bg-success-dark/20 dark:text-success-dark';
      case 'Pending':
        return 'bg-warning-light/10 text-warning-light dark:bg-warning-dark/20 dark:text-warning-dark';
      case 'Rejected':
        return 'bg-danger-light/10 text-danger-light dark:bg-danger-dark/20 dark:text-danger-dark';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="border-b border-border-light dark:border-border-dark">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Claim ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Claimant Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Village</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Claim Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Submission Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-subtle-light dark:text-subtle-dark">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {claims.map((claim) => (
            <tr key={claim._id} className="hover:bg-background-light dark:hover:bg-background-dark">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-content-light dark:text-content-dark">
                <Link href={`/claims/${claim._id}`} className="text-primary hover:underline">
                  {claim.claimId}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-subtle-light dark:text-subtle-dark">{claim.claimantName}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-subtle-light dark:text-subtle-dark">{claim.village}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-subtle-light dark:text-subtle-dark">{claim.claimType}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(claim.status)}`}>
                  {claim.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-subtle-light dark:text-subtle-dark">{new Date(claim.submissionDate).toLocaleDateString()}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Link href={`/claims/${claim._id}`} className="text-primary hover:underline">
                    View
                  </Link>
                  {claim.geojson && (
                    <button onClick={() => onGeoIconClick(claim)} className="text-primary hover:underline">
                      <span className="material-symbols-outlined">map</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimsTable;