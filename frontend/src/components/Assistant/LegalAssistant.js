import { useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function LegalAssistant({ currentClaim }) {
    const [activeTab, setActiveTab] = useState('precedents'); // 'precedents' or 'ask'
    const [precedents, setPrecedents] = useState([]);
    const [loadingPrecedents, setLoadingPrecedents] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loadingAnswer, setLoadingAnswer] = useState(false);

    const fetchPrecedents = async () => {
        if (!currentClaim) return;

        // Validation: Need at least village or district
        if (!currentClaim.village && !currentClaim.district) {
            toast.error("Claim has no village or district data to search precedents.");
            return;
        }

        setLoadingPrecedents(true);
        try {
            const response = await api.get('/claims/similar', {
                params: {
                    village: currentClaim.village || '',
                    district: currentClaim.district || '',
                    claimType: currentClaim.claimType || ''
                }
            });
            setPrecedents(response.data);
        } catch (error) {
            console.error("Failed to fetch precedents", error);
            toast.error("Failed to fetch precedents");
        } finally {
            setLoadingPrecedents(false);
        }
    };

    const askLegalQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoadingAnswer(true);
        try {
            const response = await api.post('/knowledge-base/query', {
                query: question,
                roleContext: "You are a legal assistant helping a Verification Officer verify a Forest Rights claim. Cite specific sections of the FRA Act 2006."
            });
            setAnswer(response.data);
        } catch (error) {
            console.error("Failed to get answer", error);
        } finally {
            setLoadingAnswer(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    <h3 className="font-bold">Legal Assistant</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('precedents')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'precedents' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Precedents
                </button>
                <button
                    onClick={() => setActiveTab('ask')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'ask' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Ask Law
                </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {activeTab === 'precedents' ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                            Looking for approved claims in <strong>{currentClaim?.village || 'this village'}</strong>...
                        </div>

                        {precedents.length === 0 && !loadingPrecedents && (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground text-sm mb-3">No similar approved claims found.</p>
                                <button
                                    onClick={fetchPrecedents}
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
                                >
                                    🔍 Search Again
                                </button>
                            </div>
                        )}

                        {loadingPrecedents && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        )}

                        {precedents.map(p => (
                            <div key={p._id} className="border border-border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-foreground">{p.claimantName}</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>📍 {p.village}</p>
                                    <p>📐 {p.landSizeClaimed} ha • {p.claimType}</p>
                                    <p>📅 {new Date(p.approvedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <form onSubmit={askLegalQuestion}>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., What is the evidence required for OTFD?"
                                className="w-full p-3 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                            />
                            <button
                                type="submit"
                                disabled={loadingAnswer || !question.trim()}
                                className="w-full mt-2 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loadingAnswer ? 'Analyzing Act...' : 'Ask Legal Bot'}
                            </button>
                        </form>

                        {answer && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                <p className="text-sm text-foreground whitespace-pre-wrap">{answer.answer}</p>
                                {answer.sources && (
                                    <div className="mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                                        <strong>Sources:</strong> {answer.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
