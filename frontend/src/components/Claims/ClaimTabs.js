import { useState, useEffect } from 'react';
import DocumentsViewer from './DocumentsViewer';
import api from '../../lib/api';
import AuditTrailList from './AuditTrailList';
import DssPanel from './DssPanel';
import MapSection from './MapSection';


const ClaimTabs = ({ claim }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    if (activeTab === 'audit' && auditTrail.length === 0) {
      api.get(`/mock/claims/${claim._id}/audit`).then(res => setAuditTrail(res.data));
    }
    if (activeTab === 'dss' && !recommendations) {
      api.get(`/mock/claims/${claim._id}/recommendations`).then(res => setRecommendations(res.data));
    }
  }, [activeTab, claim._id, auditTrail.length, recommendations]);

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
  
  const handleApplyRecommendation = () => {
    alert(`Applying recommendation: ${recommendations.recommendedAction}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
        case 'map':
            return <MapSection claim={claim} />;
        case 'audit':
            return <AuditTrailList auditTrail={auditTrail} />;
        case 'dss':
            return recommendations ? <DssPanel recommendations={recommendations} onApply={handleApplyRecommendation} /> : <p>Loading recommendations...</p>;
        case 'documents':
        default:
            return (
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
                            className="block w-full p-4 mt-4 text-sm border rounded-lg bg-background dark:bg-background-dark border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark"
                            placeholder="Extracted text will appear here..." 
                            rows="8"
                        />
                    </div>
                </div>
            );
    }
  }

  return (
    <div className="bg-card dark:bg-card-dark rounded-lg shadow-soft">
      <div className="border-b border-border dark:border-border-dark">
        <nav aria-label="Tabs" className="flex px-6 -mb-px space-x-8">
           {['documents', 'map', 'audit', 'dss'].map(tab => (
               <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap capitalize ${activeTab === tab ? 'text-primary border-primary dark:text-accent dark:border-accent' : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-accent'}`}
                >
                    {tab}
                </button>
           ))}
        </nav>
      </div>
      <div className="p-6">
        {renderTabContent()}
      </div>
      {isViewerOpen && <DocumentsViewer document={selectedDoc} onClose={() => setIsViewerOpen(false)} />}
    </div>
  );
};

export default ClaimTabs;