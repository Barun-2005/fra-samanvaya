const DocumentsViewer = ({ document, onClose }) => {
    if (!document) return null;
  
    // Simple viewer using an iframe for PDFs or img for images
    const isPdf = document.url.endsWith('.pdf');
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
        <div className="bg-card dark:bg-card-dark rounded-lg shadow-xl w-full max-w-4xl h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-border dark:border-border-dark">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">{document.filename}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-card-dark"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {isPdf ? (
              <iframe src={document.url} className="w-full h-full" title={document.filename} />
            ) : (
              <img src={document.url} alt={document.filename} className="max-w-full h-auto mx-auto" />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default DocumentsViewer;