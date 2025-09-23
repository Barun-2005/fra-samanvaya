import { useState } from 'react';

const ClaimsFilters = ({ onFilterChange }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({ q: query });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <form onSubmit={handleSearch}>
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-light dark:text-subtle-dark">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input w-full rounded-lg border-border-light bg-background-light py-2 pl-10 pr-4 text-sm text-content-light placeholder-subtle-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:placeholder-subtle-dark dark:focus:border-primary"
            placeholder="Search by Claimant Name or ID..."
          />
        </form>
      </div>
      <div className="col-span-1 grid grid-cols-2 gap-4 md:col-span-1 lg:col-span-3 lg:grid-cols-5">
        <select 
          onChange={(e) => onFilterChange({ state: e.target.value })}
          className="form-select w-full rounded-lg border-border-light bg-background-light py-2 text-sm text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:focus:border-primary"
        >
          <option value="">State</option>
          {/* Add state options here */}
        </select>
        <select 
          onChange={(e) => onFilterChange({ district: e.target.value })}
          className="form-select w-full rounded-lg border-border-light bg-background-light py-2 text-sm text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:focus:border-primary"
        >
          <option value="">District</option>
          {/* Add district options here */}
        </select>
        <select 
          onChange={(e) => onFilterChange({ village: e.target.value })}
          className="form-select w-full rounded-lg border-border-light bg-background-light py-2 text-sm text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:focus:border-primary"
        >
          <option value="">Village</option>
          {/* Add village options here */}
        </select>
        <select 
          onChange={(e) => onFilterChange({ claimType: e.target.value })}
          className="form-select w-full rounded-lg border-border-light bg-background-light py-2 text-sm text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:focus:border-primary"
        >
          <option value="">Claim Type</option>
          <option value="Land Ownership">Land Ownership</option>
          <option value="Forest Rights">Forest Rights</option>
        </select>
        <select 
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="form-select w-full rounded-lg border-border-light bg-background-light py-2 text-sm text-content-light focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-content-dark dark:focus:border-primary"
        >
          <option value="">Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
};

export default ClaimsFilters;