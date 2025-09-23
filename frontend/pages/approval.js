import { useState, useEffect } from 'react';
import Head from 'next/head';
import api from '../src/lib/api';
import ApprovalTable from '../src/components/Approval/ApprovalTable';

const ApprovalPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApprovalQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/mock/claims/approval-queue');
      setClaims(data);
    } catch (err) {
      setError('Failed to fetch approval queue.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const handleApprove = async (claimId) => {
    // Mock action
    alert(`Approving claim ${claimId}`);
    setClaims(claims.filter(c => c._id !== claimId));
  };

  const handleReject = async (claimId) => {
    // Mock action
    alert(`Rejecting claim ${claimId}`);
     setClaims(claims.filter(c => c._id !== claimId));
  };
  
  const handleBulkApprove = (selectedIds) => {
    alert(`Bulk approving ${selectedIds.length} claims: ${selectedIds.join(', ')}`);
    setClaims(claims.filter(c => !selectedIds.includes(c._id)));
  };

  return (
    <>
      <Head>
        <title>Claims Approval Console</title>
         <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
      </Head>
       <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
        <header className="flex items-center justify-between border-b border-gray-200/80 px-6 py-3 dark:border-gray-700/60">
            {/* Header content from HTML baseline */}
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Claims Pending Approval</h2>
                    {/* Add filter/export buttons if needed */}
                </div>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-rose-500">{error}</p>
                ) : (
                  <ApprovalTable 
                    claims={claims} 
                    onApprove={handleApprove} 
                    onReject={handleReject}
                    onBulkApprove={handleBulkApprove}
                  />
                )}
            </div>
        </main>
      </div>
    </>
  );
};

export default ApprovalPage;