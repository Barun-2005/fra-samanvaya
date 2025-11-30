import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AuthGuard from '../src/components/Layout/AuthGuard';
import RoleGuard from '../src/components/Layout/RoleGuard';
import DashboardLayout from '../src/components/Layout/DashboardLayout';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/lib/api';

const ClaimsPage = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, searchQuery, page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/claims?${params.toString()}`);

      // New API returns { data, pagination }
      if (response.data.data) {
        setClaims(response.data.data);
        setPagination(response.data.pagination);
      } else {
        // Fallback for old API structure
        setClaims(response.data);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Verified': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Claims Management</title>
      </Head>

      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Claims Management</h1>
                <p className="text-muted-foreground">View and manage forest rights claims</p>
              </div>
              {!user?.roles.includes('Citizen') && (
                <Link href="/create-claim">
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90">
                    + Create Claim
                  </button>
                </Link>
              )}
            </div>

            {/* Filters Section */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, village, or Aadhaar..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1); // Reset to page 1 on search
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-foreground font-medium whitespace-nowrap">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1); // Reset to page 1 on filter change
                    }}
                    className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Claims</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Verified">Verified</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Results Count */}
                {pagination && (
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    {pagination.total} total claims
                  </span>
                )}
              </div>
            </div>

            {/* Claims Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading claims...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button onClick={fetchClaims} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
                    Retry
                  </button>
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No claims found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Claim ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Claimant</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Village</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Land Size</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Date</th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim) => (
                        <tr key={claim._id} className="border-t border-border hover:bg-muted/50">
                          <td className="py-4 px-6 font-medium text-foreground">
                            #{claim._id?.slice(-6) || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-foreground">{claim.claimantName || 'N/A'}</td>
                          <td className="py-4 px-6 text-foreground">{claim.village || 'N/A'}</td>
                          <td className="py-4 px-6 text-foreground">
                            {claim.landSizeClaimed || claim.boundaryArea || 'N/A'} ha
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">
                            {claim.dateSubmitted ? new Date(claim.dateSubmitted).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-4 px-6">
                            <Link href={`/claims/${claim._id}`}>
                              <button className="text-primary hover:underline font-medium">
                                View Details
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${page === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border hover:bg-muted'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default function Claims() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['Citizen', 'Data Entry Officer', 'Verification Officer', 'Approving Authority', 'Super Admin']}>
        <ClaimsPage />
      </RoleGuard>
    </AuthGuard>
  );
}