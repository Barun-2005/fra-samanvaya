import { useState } from 'react';
import DocumentsViewer from './DocumentsViewer';
import api from '../../lib/api';

const ClaimTabs = ({ claim }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleViewDoc = (doc) => {
    setSelectedDoc(doc);
    setIsViewerOpen(true);
  };

  const handleExtractOcr = async (docId) => {
    setOcrLoading(true);
    setOcrText('');
    try {
      const { data } = await api.post(`/documents/${docId}/ocr`);
      setOcrText(data.ocrText);
    } catch (error) {
      console.error('OCR extraction failed:', error);
      setOcrText('Failed to extract text.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="bg-card dark:bg-card-dark rounded-lg shadow-soft">
      <div className="border-b border-border dark:border-border-dark">
        <nav aria-label="Tabs" className="flex px-6 -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'text-primary border-primary dark:text-accent dark:border-accent' : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-accent hover:border-primary dark:hover:border-accent'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'documents' ? 'text-primary border-primary dark:text-accent dark:border-accent' : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-accent hover:border-primary dark:hover:border-accent'}`}
          >
            Documents
          </button>
        </nav>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-bold text-primary dark:text-accent">Claim Summary</h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
              This is a summary of the claim. Details about the claim type, submission reason, and other metadata would be displayed here.
            </p>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary dark:text-accent">Submitted Documents</h3>
            <ul className="space-y-3">
              {claim.documents.map((doc) => (
                <li key={doc._id} className="flex items-center justify-between p-3 rounded-lg bg-background dark:bg-background-dark">
                  <div>
                    <p className="font-medium text-text-primary dark:text-text-primary-dark">{doc.filename}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                      Uploaded by {doc.uploader} on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleViewDoc(doc)} className="text-primary dark:text-accent hover:underline text-sm">View</button>
                    <button onClick={() => handleExtractOcr(doc._id)} disabled={ocrLoading} className="text-primary dark:text-accent hover:underline text-sm disabled:opacity-50">
                      {ocrLoading ? 'Extracting...' : 'Extract OCR'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
             <div>
                <label className="text-lg font-bold text-primary dark:text-accent" htmlFor="ocr-text">OCR Extracted Text</label>
                <textarea 
                    id="ocr-text"
                    value={ocrText}
                    readOnly
                    className="block w-full p-4 mt-4 text-sm border rounded-lg bg-background dark:bg-background-dark border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent"
                    placeholder="Extracted text will appear here..." 
                    rows="8"
                />
            </div>
          </div>
        )}
      </div>
      {isViewerOpen && <DocumentsViewer document={selectedDoc} onClose={() => setIsViewerOpen(false)} />}
    </div>
  );
};

export default ClaimTabs;