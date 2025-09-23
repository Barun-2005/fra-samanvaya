// A simple placeholder for the modal.
// You can replace this with a proper modal implementation using a library like react-leaflet.

const MapPreviewModal = ({ claim, onClose }) => {
    if (!claim) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Claim Location</h2>
          <p className="text-gray-600 dark:text-gray-300">Displaying map for Claim ID: {claim.claimId}</p>
          <div className="my-4 bg-gray-200 dark:bg-gray-700 h-64 w-96 flex items-center justify-center">
            {/* Placeholder for map */}
            <p className="text-gray-500 dark:text-gray-400">Map would be here.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default MapPreviewModal;