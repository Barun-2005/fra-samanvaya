import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import ClaimOverviewCard from '../../src/components/Claims/ClaimOverviewCard';
import ClaimTabs from '../../src/components/Claims/ClaimTabs';
import { mockClaims } from '../api/mock/_data'; // Import the complete mock data

const ClaimDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for the router to be ready and the id to be available
    if (router.isReady) {
      if (id) {
        setLoading(true);
        setError(null);
        // Find the claim directly from the imported mock data.
        // The data is already in the correct shape.
        const foundClaim = mockClaims.find(c => c._id === id);

        if (foundClaim) {
          setClaim(foundClaim);
        } else {
          setError(`Claim with ID "${id}" not found.`);
        }
        setLoading(false);
      } else {
        // Handle the case where the router is ready but there's no ID in the URL
        setError('No claim ID provided.');
        setLoading(false);
      }
    }
  }, [router.isReady, id]);

  // A more robust loading state
  if (loading || !router.isReady) {
      return <p>Loading claim details...</p>;
  }
  
  if (error) {
      return <p className="text-danger-light dark:text-danger-dark">{error}</p>;
  }

  if (!claim) {
      return <p>Claim not found.</p>;
  }

  const handleApprove = () => {
    alert(`Mock Action: Approve claim ${claim.claimId}`);
  };

  const handleReject = () => {
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
