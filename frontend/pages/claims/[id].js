import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
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
  Edit,
  Shield,
  Scale,
  Send
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

  // New State for AI Features
  const [similarClaims, setSimilarClaims] = useState([]);
  const [showLegalAdvisor, setShowLegalAdvisor] = useState(false);

  useEffect(() => {
    if (router.isReady && id) {
      fetchClaim();
    }
  }, [router.isReady, id]);

  // Fetch similar claims when claim is loaded
  useEffect(() => {
    if (claim && (user?.roles.includes('Approving Authority') || user?.roles.includes('Verification Officer'))) {
      fetchSimilarClaims();
    }
  }, [claim, user]);

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

  const fetchSimilarClaims = async () => {
    try {
      // Use the new vector search endpoint
      const response = await api.get(`/claims/similar?text=${encodeURIComponent(claim.reasonForClaim || '')}&village=${claim.village}&district=${claim.district}&claimType=${claim.claimType}`);
      setSimilarClaims(response.data);
    } catch (err) {
      console.error('Error fetching similar claims:', err);
    }
  };

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      await api.post(`/claims/${id}/verify`, { notes: 'Claim verified by officer' });
      toast.success('Claim verified successfully!');
      setShowVerifyModal(false);
      await fetchClaim();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await api.post(`/claims/${id}/approve`, { notes: 'Claim approved' });
      toast.success('Claim approved successfully!');
      setShowApproveModal(false);
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
                {/* AI Legal Advisor Button */}
                {(canApprove || canVerify) && (
                  <button
                    onClick={() => setShowLegalAdvisor(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <Shield className="w-5 h-5" /> Consult AI
                  </button>
                )}

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
                    onClick={() => setShowVerifyModal(true)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                  >
                    <Check className="w-5 h-5" /> Verify Claim
                  </button>
                )}
                {canApprove && (
                  <button
                    onClick={() => setShowApproveModal(true)}
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
                      {claim.status === 'ConflictDetected' && (
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

                      {/* PRECEDENTS SECTION (New) */}
                      {(canApprove || canVerify) && similarClaims.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-indigo-600" />
                            Similar Claims Analysis (Precedents)
                          </h3>
                          <div className="space-y-4">
                            {similarClaims.map((sim, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{sim.claimantName}</p>
                                    <p className="text-xs text-slate-500">{sim.village} • {new Date(sim.approvedAt).toLocaleDateString()}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    Approved
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                  "{sim.reasonForClaim?.substring(0, 100)}..."
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-500"
                                      style={{ width: `${(sim.score || 0.85) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-indigo-600">
                                    {Math.round((sim.score || 0.85) * 100)}% Match
                                  </span>
                                </div>
                              </div>
                            ))}
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
                                <circle
                                  cx="48" cy="48" r="40"
                                  stroke="currentColor" strokeWidth="8" fill="transparent"
                                  strokeDasharray={251.2}
                                  strokeDashoffset={251.2 * (1 - ((claim.veracityScore || 0) / 100))}
                                  className={`${(claim.veracityScore || 0) > 70 ? 'text-green-500' : (claim.veracityScore || 0) > 40 ? 'text-yellow-500' : 'text-red-500'}`}
                                />
                              </svg>
                              <span className="absolute text-2xl font-bold text-slate-900 dark:text-white">{claim.veracityScore || 0}%</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {(claim.veracityScore || 0) > 80 ? 'High consistency between submitted documents and historical records.' :
                                (claim.veracityScore || 0) > 50 ? 'Moderate consistency. Some documents may need manual verification.' :
                                  'Low consistency detected. Detailed field verification recommended.'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Scheme Eligibility</h3>
                          <div className="space-y-3">
                            {claim.eligibleSchemes && claim.eligibleSchemes.length > 0 ? (
                              claim.eligibleSchemes.map((scheme, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{scheme}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">No specific schemes identified at this stage.</p>
                            )}
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

        {/* Legal Workbench Modal (Context Aware) */}
        {showLegalAdvisor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex-1 p-0 overflow-hidden">
                <LegalWorkbench claim={claim} onClose={() => setShowLegalAdvisor(false)} />
              </div>
            </div>
          </div>
        )}

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
        {/* Verify Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify Claim</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to verify this claim? This will move the claim to the Approval stage.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50"
                >
                  Confirm Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Approve Claim</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to approve this claim? This action is final and will generate the Title Deed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

// Legal Workbench Component (Context Aware: Vidhi vs Satark)
const LegalWorkbench = ({ claim, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analysis'); // analysis | drafting

  // Role Detection
  const isVerifier = user?.roles.includes('Verification Officer');
  const isApprover = user?.roles.includes('Approving Authority');

  // Configuration based on Role
  const config = isVerifier ? {
    title: "Satark Analysis Panel",
    subtitle: "Vigilance Engine • FRA 2006",
    agentName: "Satark AI",
    agentRole: "verification_officer",
    icon: <Shield className="w-6 h-6 text-indigo-300" />,
    allowDrafting: false
  } : {
    title: "Vidhi Legal Workbench",
    subtitle: "Governance Engine • FRA 2006",
    agentName: "Vidhi AI",
    agentRole: "approving_authority",
    icon: <Scale className="w-6 h-6 text-indigo-300" />,
    allowDrafting: true
  };

  const [messages, setMessages] = useState([
    { role: 'assistant', text: `I am ${config.agentName}. I have analyzed Claim #${claim._id.slice(-6)}. How can I assist?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Drafting State
  const [drafting, setDrafting] = useState(false);
  const [order, setOrder] = useState(null); // { englishOrder, vernacularOrder }
  const [language, setLanguage] = useState('english'); // english | vernacular

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await api.post('/chat', {
        message: text,
        role: config.agentRole, // Dynamic Role
        context: {
          claimId: claim._id,
          userId: user?.id
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }]);
    } catch (e) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', text: `Error connecting to ${config.agentName}: ${e.response?.data?.message || e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // ... (Drafting logic remains same, but only accessible if allowDrafting is true)

  const handleDraftOrder = async (verdict) => {
    setDrafting(true);
    setActiveTab('drafting');
    try {
      const res = await api.post('/vidhi/draft-order', {
        claimId: claim._id,
        verdict: verdict,
        reasoning: claim.reasonForClaim || "Based on verification report and submitted documents."
      });

      // Clean Markdown for "Canvas" feel
      const cleanEnglish = res.data.englishOrder.replace(/\*\*/g, '').replace(/###/g, '').replace(/---/g, '').replace(/##/g, '');
      const cleanVernacular = res.data.vernacularOrder.replace(/\*\*/g, '').replace(/###/g, '').replace(/---/g, '').replace(/##/g, '');

      setOrder({ englishOrder: cleanEnglish, vernacularOrder: cleanVernacular });
    } catch (e) {
      toast.error("Failed to draft order");
    } finally {
      setDrafting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await api.put(`/claims/${claim._id}`, {
        draftOrder: order
      });
      toast.success("Draft saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save draft");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden">
      {/* Workbench Header */}
      <div className="p-4 bg-indigo-900 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{config.title}</h3>
            <p className="text-xs text-indigo-300">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-indigo-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'analysis' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-300 hover:text-white'}`}
            >
              Analysis
            </button>
            {config.allowDrafting && (
              <button
                onClick={() => setActiveTab('drafting')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'drafting' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-300 hover:text-white'}`}
              >
                Drafting
              </button>
            )}
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: CHAT & ANALYSIS */}
        <div className={`flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700 ${activeTab === 'drafting' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>
                  <div className="flex items-center gap-2 mb-1 opacity-70 text-xs uppercase font-bold tracking-wider">
                    {m.role === 'user' ? 'You' : config.agentName}
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm p-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                Thinking...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
              <input
                className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={`Ask ${config.agentName} to analyze laws, precedents, or evidence...`}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: DRAFTING BENCH (Only for Approvers) */}
        {config.allowDrafting && (
          <div className={`flex-1 bg-white dark:bg-slate-800 flex flex-col ${activeTab === 'analysis' ? 'hidden md:flex' : 'flex'}`}>
            {!order ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Legal Order Drafting</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                  Vidhi can automatically draft a formal legal order (Patta) in English and the local vernacular language based on the claim details.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDraftOrder('Approved')}
                    disabled={drafting}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                  >
                    {drafting ? 'Drafting...' : 'Draft Approval Order'}
                  </button>
                  <button
                    onClick={() => handleDraftOrder('Rejected')}
                    disabled={drafting}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
                  >
                    Draft Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Language:</span>
                    <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                      <button
                        onClick={() => setLanguage('english')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'english' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('vernacular')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'vernacular' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Hindi / Odia
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1" title="Save Draft">
                      <Edit className="w-3 h-3" /> Save Draft
                    </button>
                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-0 relative">
                  <textarea
                    className="w-full h-full p-8 font-serif leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:ring-0 resize-none outline-none"
                    value={language === 'english' ? order.englishOrder : order.vernacularOrder}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setOrder(prev => ({
                        ...prev,
                        [language === 'english' ? 'englishOrder' : 'vernacularOrder']: newText
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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
