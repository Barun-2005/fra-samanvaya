import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import AuthGuard from '../../src/components/Layout/AuthGuard';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AIAnalysisCard from '../../src/components/Claims/AIAnalysisCard';
import ConflictWarning from '../../src/components/Claims/ConflictWarning';
import SchemeRecommendationsWidget from '../../src/components/Dashboard/SchemeRecommendationsWidget';
import LegalAssistant from '../../src/components/Assistant/LegalAssistant';
import RiskAnalysisPanel from '../../src/components/Claims/RiskAnalysisPanel';

const ClaimDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (router.isReady && id) {
      fetchClaim();
    }
  }, [router.isReady, id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/claims/${id}`);
      setClaim(response.data);
    } catch (err) {
      console.error('Error fetching claim:', err);
      setError(err.response?.data?.message || 'Failed to load claim');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!confirm('Are you sure you want to verify this claim?')) return;

    try {
      setActionLoading(true);
      await api.post(`/claims/${id}/verify`, { notes: 'Claim verified by officer' });
      toast.success('Claim verified successfully!');
      await fetchClaim(); // Refresh claim data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this claim?')) return;

    try {
      setActionLoading(true);
      await api.post(`/claims/${id}/approve`, { notes: 'Claim approved' });
      toast.success('Claim approved successfully!');
      await fetchClaim(); // Refresh claim data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/claims/${id}/reject`, { reason: rejectionReason });
      toast.success('Claim rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      await fetchClaim(); // Refresh claim data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !router.isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <Link href="/claims">
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
              Back to Claims
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!claim) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Verified': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine if user can take actions
  const canVerify = user?.roles.includes('Verification Officer') && claim.status === 'Submitted';
  const canApprove = user?.roles.includes('Approving Authority') && claim.status === 'Verified';
  const canReject = (user?.roles.includes('Verification Officer') || user?.roles.includes('Approving Authority'))
    && (claim.status === 'Submitted' || claim.status === 'Verified');

  return (
    <>
      <Head>
        <title>Claim Details - {claim.claimId || claim._id}</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link href="/claims">
                  <button className="text-primary hover:underline mb-2">← Back to Claims</button>
                </Link>
                <h1 className="text-3xl font-bold text-foreground">
                  Claim #{claim._id?.slice(-6) || 'Unknown'}
                </h1>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                {claim.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mb-6 gap-4">
              {/* Edit Button for Citizen/DataEntry if Submitted/Rejected */}
              {(user?.roles.includes('Citizen') || user?.roles.includes('Data Entry Officer')) &&
                (claim.status === 'Submitted' || claim.status === 'Rejected') && (
                  <Link href={`/claims/edit/${claim._id}`}>
                    <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
                      ✏️ Edit Claim
                    </button>
                  </Link>
                )}
            </div>

            {(canVerify || canApprove || canReject) && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
                <div className="flex gap-4">
                  {canVerify && (
                    <button
                      onClick={handleVerify}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      ✅ Verify Claim
                    </button>
                  )}

                  {canApprove && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      ✅ Approve Claim
                    </button>
                  )}

                  {canReject && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      ❌ Reject Claim
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Claim Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Claimant Name</span>
                    <p className="text-foreground font-medium">{claim.claimantName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Aadhaar Number</span>
                    <p className="text-foreground font-medium">{claim.aadhaarNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Village</span>
                    <p className="text-foreground font-medium">{claim.village || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Land Details */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Land Details</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Land Size Claimed</span>
                    <p className="text-foreground font-medium">{claim.landSizeClaimed || claim.boundaryArea || 'N/A'} hectares</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Survey Number</span>
                    <p className="text-foreground font-medium">{claim.surveyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Claim Type</span>
                    <p className="text-foreground font-medium">{claim.claimType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-foreground mb-4">Uploaded Documents</h2>
                {claim.documents && claim.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {claim.documents.map((doc, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground capitalize">
                            {doc.type || 'Document'}
                          </span>
                          <a
                            href={`http://localhost:4000/${doc.fileRef}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline"
                          >
                            Open in New Tab ↗
                          </a>
                        </div>
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                          {doc.fileRef.endsWith('.pdf') ? (
                            <iframe
                              src={`http://localhost:4000/${doc.fileRef}`}
                              className="w-full h-full"
                              title="Document Preview"
                            />
                          ) : (
                            <img
                              src={`http://localhost:4000/${doc.fileRef}`}
                              alt="Document"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded.</p>
                )}
              </div>

              {/* Reason for Claim */}
              <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
                <h2 className="text-xl font-semibold text-foreground mb-4">Reason for Claim</h2>
                <p className="text-foreground">{claim.reasonForClaim || 'No reason provided'}</p>
              </div>

              {/* AI Analysis Section - For Officers */}
              {!user?.roles.includes('Citizen') && (
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <AIAnalysisCard claimId={claim._id} initialAnalysis={claim.assetSummary} />
                      <SchemeRecommendationsWidget claimId={claim._id} />
                    </div>
                    {/* Legal Assistant Sidebar for Verifiers/Approvers */}
                    <div className="lg:col-span-1 space-y-6">
                      <LegalAssistant currentClaim={claim} />
                      {user?.roles.includes('Approving Authority') && (
                        <RiskAnalysisPanel claimId={claim._id} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Conflict Warning */}
              {claim.geojson && (
                <div className="md:col-span-2">
                  <ConflictWarning claimId={claim._id} geojson={claim.geojson} />
                </div>
              )}

              {/* Status History */}
              {claim.statusHistory && claim.statusHistory.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Status History</h2>
                  <div className="space-y-2">
                    {claim.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(history.changedAt).toLocaleString()}
                        </span>
                        {history.reason && (
                          <span className="text-foreground">- {history.reason}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {claim.rejectionReason && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 md:col-span-2">
                  <h2 className="text-xl font-semibold text-red-900 mb-4">Rejection Reason</h2>
                  <p className="text-red-800">{claim.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Reject Claim</h2>
              <p className="text-muted-foreground mb-4">Please provide a reason for rejection:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default function ClaimDetail() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['Citizen', 'Data Entry Officer', 'Verification Officer', 'Approving Authority', 'Super Admin']}>
        <ClaimDetailPage />
      </RoleGuard>
    </AuthGuard>
  );
}
