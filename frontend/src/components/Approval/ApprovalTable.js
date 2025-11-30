import { useState } from 'react';
import Link from 'next/link';

const ApprovalTable = ({ claims, onApprove, onReject, onBulkApprove }) => {
  const [selected, setSelected] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(claims.map(c => c._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-900/50">
      <div className="flex justify-end p-4">
          <button 
            onClick={() => onBulkApprove(selected)} 
            disabled={selected.length === 0}
            className="flex items-center gap-2 rounded bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            Bulk Approve ({selected.length})
          </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="p-4">
                <input type="checkbox" onChange={handleSelectAll} checked={selected.length === claims.length && claims.length > 0} />
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Claim ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Applicant Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Submission Date</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/80 dark:divide-gray-700/60">
            {claims.map(claim => (
              <tr key={claim._id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                <td className="p-4">
                  <input type="checkbox" checked={selected.includes(claim._id)} onChange={() => handleSelectOne(claim._id)} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <Link href={`/claims/${claim._id}`}>{claim.claimId}</Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-300">{claim.claimantName}</td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(claim.submissionDate).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">{claim.status}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onApprove(claim._id)} className="flex items-center gap-1.5 rounded bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-200">
                      <span className="material-symbols-outlined text-sm">verified_user</span> Approve
                    </button>
                    <button onClick={() => onReject(claim._id)} className="flex items-center gap-1.5 rounded bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-200">
                      <span className="material-symbols-outlined text-sm">block</span> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalTable;