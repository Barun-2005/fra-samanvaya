import { useState, useEffect } from 'react';
import Head from 'next/head';
import { mockClaims } from '../pages/api/mock/_data'; // Import mock data directly
import ClaimsFilters from '../src/components/Claims/ClaimsFilters';
import ClaimsTable from '../src/components/Claims/ClaimsTable';
import Pagination from '../src/components/Claims/Pagination';
import MapPreviewModal from '../src/components/Claims/MapPreviewModal';

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    q: '',
    state: '',
    district: '',
    village: '',
    claimType: '',
    status: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  // This effect will now run on the client side to filter and paginate the imported data
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      // Apply filtering
      const filteredClaims = mockClaims.filter(claim => {
        return (
          (filters.q ? claim.claimantName.toLowerCase().includes(filters.q.toLowerCase()) || claim.claimId.toLowerCase().includes(filters.q.toLowerCase()) : true) &&
          (filters.village ? claim.village === filters.village : true) &&
          (filters.claimType ? claim.claimType === filters.claimType : true) &&
          (filters.status ? claim.status === filters.status : true)
        );
      });

      // Apply pagination
      const total = filteredClaims.length;
      const pages = Math.ceil(total / filters.limit);
      const startIndex = (filters.page - 1) * filters.limit;
      const paginatedClaims = filteredClaims.slice(startIndex, startIndex + filters.limit);

      setClaims(paginatedClaims);
      setPagination({
        page: filters.page,
        limit: filters.limit,
        total,
        pages,
      });
    } catch (err) {
      setError('Failed to load or process claims data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
  
  const handleGeoIconClick = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleExport = () => {
      alert("This is a mock action. In a real app, this would export the filtered claims to a CSV file.");
  }


  return (
    <>
      <Head>
        <title>Claims Management</title>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </Head>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-content-light dark:text-content-dark">
        <div className="flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-border-light bg-surface-light px-10 py-4 shadow-soft dark:border-border-dark dark:bg-surface-dark">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 text-primary">
                  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM4 8.24L12 12.75L20 8.24V15.76L12 20.25L4 15.76V8.24ZM12 4.47L18.97 8.5L12 12.5L5.03 8.5L12 4.47Z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-content-light dark:text-content-dark">Claim Management</h2>
              </div>
              <nav className="flex items-center gap-6">
                <a className="text-sm font-medium text-subtle-light hover:text-primary dark:text-subtle-dark dark:hover:text-primary" href="#">Dashboard</a>
                <a aria-current="page" className="text-sm font-bold text-primary dark:text-primary" href="#">Claims</a>
                <a className="text-sm font-medium text-subtle-light hover:text-primary dark:text-subtle-dark dark:hover:text-primary" href="#">Reports</a>
                <a className="text-sm font-medium text-subtle-light hover:text-primary dark:text-subtle-dark dark:hover:text-primary" href="#">Users</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-background-light text-subtle-light hover:bg-primary/10 hover:text-primary dark:bg-background-dark dark:text-subtle-dark dark:hover:bg-primary/20">
                <span className="material-symbols-outlined"> notifications </span>
              </button>
              <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDVkEeBxk6lDo7F4LLSqgOg73tqxtUpY__csQ_wXP77bRgMZDAudPl-kY0tDs3GaDbDKpFJ9ONdRN0rs-Tt-04LZXGSIDwZBX5Ujf-O_o7Wcmje4ypYhOT4vk4Nj-X6bKPJoqr81Gko33CllkECtl6u7rRG7k5H5BuVSu0zPFeUwHkDtYAw9m1YVssH04LP8UKIBFoyIPAVC4F2_GlkGKYcdqFU0t-hjb4l4ktrP4JTMfbAhRUDh55VRBIpux8Wv4MduEBzZwBpih3l")' }}></div>
            </div>
          </header>
          <main className="flex-1 px-10 py-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
                <button 
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 rounded-lg bg-success-light px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-light/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:bg-success-dark dark:text-background-dark dark:hover:bg-success-dark/90 dark:focus-visible:ring-offset-background-dark"
                >
                  <span className="material-symbols-outlined text-base"> download </span>
                  <span className="truncate">Export CSV</span>
                </button>
              </div>
              <div className="rounded-xl border border-border-light bg-surface-light p-6 shadow-soft dark:border-border-dark dark:bg-surface-dark">
                <ClaimsFilters onFilterChange={handleFilterChange} />
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-danger-light dark:text-danger-dark">{error}</p>
                ) : (
                  <>
                    <ClaimsTable claims={claims} onGeoIconClick={handleGeoIconClick} />
                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
        {isModalOpen && (
          <MapPreviewModal claim={selectedClaim} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </>
  );
};

export default ClaimsPage;