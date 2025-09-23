const Pagination = ({ pagination, onPageChange }) => {
    const { page, pages, total } = pagination;
  
    return (
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-subtle-light dark:text-subtle-dark">
          Showing page {page} of {pages} ({total} results)
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onPageChange(page - 1)} 
            disabled={page === 1}
            className="rounded-lg border border-border-light bg-surface-light px-3 py-1.5 text-sm font-medium hover:bg-background-light disabled:opacity-50 dark:border-border-dark dark:bg-surface-dark dark:hover:bg-background-dark"
          >
            Previous
          </button>
          <button 
            onClick={() => onPageChange(page + 1)} 
            disabled={page === pages}
            className="rounded-lg border border-border-light bg-surface-light px-3 py-1.5 text-sm font-medium hover:bg-background-light disabled:opacity-50 dark:border-border-dark dark:bg-surface-dark dark:hover:bg-background-dark"
          >
            Next
          </button>
        </div>
      </div>
    );
  };
  
  export default Pagination;