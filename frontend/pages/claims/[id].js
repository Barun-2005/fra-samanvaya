import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import AuthGuard from '../../src/components/Layout/AuthGuard';
import RoleGuard from '../../src/components/Layout/RoleGuard';
import DashboardLayout from '../../src/components/Layout/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Map as MapIcon,
  Download,
  ChevronRight,
  ArrowLeft,
  Check,
  X,
  Edit
} from 'lucide-react';

// Dynamic import for Map to avoid SSR issues
const ClaimBoundaryMap = dynamic(
  () => import('../../src/components/Claims/ClaimBoundaryMap'),
  { ssr: false }
);

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
  const [activeTab, setActiveTab] = useState('overview');

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
      await fetchClaim();
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
      await fetchClaim();
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
      await fetchClaim();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !router.isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-slate-900 dark:text-white mb-4">{error || 'Claim not found'}</p>
          <Link href="/claims">
            <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover">
              Back to Claims
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Permissions
  const canVerify = user?.roles.includes('Verification Officer') && claim.status === 'Submitted';
  const canApprove = user?.roles.includes('Approving Authority') && claim.status === 'Verified';
  const canReject = (user?.roles.includes('Verification Officer') || user?.roles.includes('Approving Authority'))
    && (claim.status === 'Submitted' || claim.status === 'Verified');

  return (
    <>
      <Head>
        <title>Claim #{claim._id?.slice(-6)} | FRA Samanvay</title>
      </Head>

      <DashboardLayout>
        <div className="p-4 lg:p-8 min-h-screen">
          <div className="max-w-[1600px] mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href="/claims">
                    <button className="text-slate-500 hover:text-primary transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </Link>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    #{claim._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${claim.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      claim.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {claim.status}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Claim Details: {claim.claimantName}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> {claim.village} • Submitted on {new Date(claim.dateSubmitted || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="w-5 h-5" /> Reject
                  </button>
                )}
                {canVerify && (
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                  >
                    <Check className="w-5 h-5" /> Verify Claim
                  </button>
                )}
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Claim
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                {/* Claimant Profile */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400">
                      {claim.claimantName.charAt(0)}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{claim.claimantName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{claim.aadhaarNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Mobile Number</p>
                      <p className="font-medium text-slate-900 dark:text-white">+91 98765 43210</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Address</p>
                      <p className="font-medium text-slate-900 dark:text-white">{claim.village}, District Name</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Land Size Claimed</p>
                      <p className="font-medium text-slate-900 dark:text-white">{claim.landSizeClaimed || claim.boundaryArea || '0'} Hectares</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Claim Timeline</h3>
                  <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                    {claim.statusHistory?.map((history, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                          }`}></div>
                        <div>
                          <p className={`font-bold ${idx === 0 ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {history.status}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(history.changedAt).toLocaleDateString()}
                          </p>
                          {history.reason && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                              "{history.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600"></div>
                      <p className="font-medium text-slate-900 dark:text-white">Claim Submitted</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(claim.dateSubmitted || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {['overview', 'documents', 'map', 'analysis'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Conflict Warning */}
                      {claim.geojson && (
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-400">Potential Conflict Detected</h4>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                              AI has detected an overlap with a protected forest area. Please review the map carefully.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Reason for Claim</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {claim.reasonForClaim || 'No reason provided by the claimant.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4">AI Veracity Score</h3>
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.82)} className="text-green-500" />
                              </svg>
                              <span className="absolute text-2xl font-bold text-slate-900 dark:text-white">82%</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              High consistency between submitted documents and historical records.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Scheme Eligibility</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">PM Kisan Samman Nidhi</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">National Bamboo Mission</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {claim.documents?.map((doc, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm group">
                          <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                            {doc.fileRef.endsWith('.pdf') ? (
                              <FileText className="w-12 h-12 text-slate-400" />
                            ) : (
                              <img src={`http://localhost:4000/${doc.fileRef}`} alt="Doc" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a href={`http://localhost:4000/${doc.fileRef}`} target="_blank" rel="noreferrer">
                                <button className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100">
                                  View Document
                                </button>
                              </a>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{doc.type || 'Document'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded on {new Date(claim.dateSubmitted).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'map' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <ClaimBoundaryMap
                        initialGeoJson={claim.geojson}
                        readOnly={!user?.roles.includes('Citizen') && !user?.roles.includes('Data Entry Officer')}
                      />
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Detailed AI Analysis</h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{claim.assetSummary || 'No detailed analysis available yet.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reject Claim</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Please provide a reason for rejection. This will be visible to the claimant.</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/50 min-h-[120px]"
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Reject
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
      <RoleGuard allowedRoles={['Citizen', 'Data Entry Operator', 'Verification Officer', 'Approving Authority', 'Super Admin', 'NGO Viewer', 'NGO Member', 'Public Viewer']}>
        <ClaimDetailPage />
      </RoleGuard>
    </AuthGuard>
  );
}
