// A simple placeholder for the modal.
// You can replace this with a proper modal implementation using a library like react-leaflet.

const MapPreviewModal = ({ claim, onClose }) => {
    if (!claim) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4">Claim Location</h2>
          <p>Displaying map for Claim ID: {claim.claimId}</p>
          <div className="my-4 bg-gray-200 dark:bg-gray-700 h-64 w-96 flex items-center justify-center">
            {/* Placeholder for map */}
            <p>Map would be here.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg border border-border-light bg-surface-light px-3 py-1.5 text-sm font-medium hover:bg-background-light dark:border-border-dark dark:bg-surface-dark dark:hover:bg-background-dark"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default MapPreviewModal;