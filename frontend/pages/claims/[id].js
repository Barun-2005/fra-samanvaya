import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import api from '../../../src/lib/api';
import ClaimOverviewCard from '../../../src/components/Claims/ClaimOverviewCard';
import ClaimTabs from '../../../src/components/Claims/ClaimTabs';

const ClaimDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchClaim = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await api.get(`/mock/claims/${id}`);
          setClaim(data);
        } catch (err) {
          setError('Failed to fetch claim details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchClaim();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger-light dark:text-danger-dark">{error}</p>;
  if (!claim) return <p>Claim not found.</p>;

  const handleApprove = () => {
    // In a real app, this would trigger a PUT/POST request to '/api/claims/:id/approve'
    alert(`Mock Action: Approve claim ${claim.claimId}`);
  };

  const handleReject = () => {
    // In a real app, this would trigger a PUT/POST request to '/api/claims/:id/reject'
    alert(`Mock Action: Reject claim ${claim.claimId}`);
  };

  return (
    <>
      <Head>
        <title>Claim Details - {claim.claimId}</title>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
      </Head>
      <div className="flex h-screen w-full font-display bg-background dark:bg-background-dark">
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-10 py-4 border-b bg-card dark:bg-card-dark border-border dark:border-border-dark">
             {/* Header content from HTML baseline */}
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-3">
                <ClaimOverviewCard claim={claim} />
              </div>
              <div className="col-span-12 lg:col-span-9">
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-card dark:bg-card-dark shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">Claim Overview</h2>
                        <p className="text-text-secondary dark:text-text-secondary-dark">Review and manage claim details for {claim.personalInfo.fullName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                            onClick={handleApprove}
                            disabled={!claim.userPermissions?.canApprove}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-success hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:opacity-50"
                        >
                            Approve Claim
                        </button>
                         <button 
                            onClick={handleReject}
                            disabled={!claim.userPermissions?.canReject}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-danger-light hover:bg-danger-light/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-light disabled:opacity-50"
                        >
                            Reject Claim
                        </button>
                      </div>
                    </div>
                  </div>
                  <ClaimTabs claim={claim} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ClaimDetailPage;