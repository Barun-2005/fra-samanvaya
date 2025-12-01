import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function FraBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Determine persona based on role
    const getPersona = () => {
        if (user?.roles.includes('Verification Officer')) return {
            greeting: 'Hello Officer. I can help you find precedents, verify evidence, or cite specific Act sections.',
            context: 'You are a Legal Assistant helping a Verification Officer. Focus on evidence, precedents, and legal sections of FRA 2006.'
        };
        if (user?.roles.includes('Data Entry Officer')) return {
            greeting: 'Hello. I can assist with form filling, digitizing records, or translating documents.',
            context: 'You are a Data Assistant helping a Data Entry Officer. Focus on accuracy, form fields, and translating handwritten documents.'
        };
        if (user?.roles.includes('Approving Authority')) return {
            greeting: 'Greetings. I can assist with risk assessment, drafting orders, or clarifying legal ambiguities.',
            context: 'You are a Legal Consultant helping an Approving Authority (SDLC/DLC). Focus on risk mitigation, legal validity, and drafting title deeds.'
        };
        if (user?.roles.includes('Scheme Admin')) return {
            greeting: 'Hello. I can help you match schemes to villages or analyze beneficiary demographics.',
            context: 'You are a Policy Expert helping a Scheme Admin. Focus on government schemes (Central/State), eligibility criteria, and convergence opportunities.'
        };
        if (user?.roles.includes('Super Admin')) return {
            greeting: 'System Online. I can help you analyze anomalies, monitor system health, or query user data.',
            context: 'You are a System Administrator AI. Focus on system health, security anomalies, and user management metrics.'
        };
        return {
            greeting: 'Namaste! 🙏 I am FraBot. Ask me anything about the Forest Rights Act or your claim.',
            context: 'You are a helpful assistant explaining the Forest Rights Act 2006 to a tribal citizen. Keep answers simple, encouraging, and clear.'
        };
    };

    const persona = getPersona();

    const [messages, setMessages] = useState([
        { role: 'assistant', text: persona.greeting }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/knowledge-base/query', {
                query: input,
                roleContext: persona.context
            });

            const botMessage = {
                role: 'assistant',
                text: response.data.answer,
                sources: response.data.sources
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-card border border-border shadow-2xl rounded-2xl w-80 md:w-96 h-[500px] flex flex-col mb-4 animate-in slide-in-from-bottom-10 fade-in">
                    {/* Header */}
                    <div className="p-4 bg-primary text-primary-foreground rounded-t-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                {user?.roles.includes('Verification Officer') ? '⚖️' :
                                    user?.roles.includes('Approving Authority') ? '🛡️' :
                                        user?.roles.includes('Scheme Admin') ? '💼' :
                                            user?.roles.includes('Super Admin') ? '👁️' :
                                                user?.roles.includes('Data Entry Officer') ? '⌨️' : '🤖'}
                            </div>
                            <div>
                                <h3 className="font-bold">
                                    {user?.roles.includes('Verification Officer') ? 'Legal Assistant' :
                                        user?.roles.includes('Approving Authority') ? 'Risk Consultant' :
                                            user?.roles.includes('Scheme Admin') ? 'Policy Expert' :
                                                user?.roles.includes('Super Admin') ? 'System Guardian' :
                                                    user?.roles.includes('Data Entry Officer') ? 'Data Helper' : 'FraBot AI'}
                                </h3>
                                <p className="text-xs opacity-90">
                                    {user?.roles.includes('Verification Officer') ? 'Precedents & Evidence' :
                                        user?.roles.includes('Approving Authority') ? 'Risk & Compliance' :
                                            user?.roles.includes('Scheme Admin') ? 'Schemes & Demographics' :
                                                user?.roles.includes('Super Admin') ? 'System Monitoring' :
                                                    user?.roles.includes('Data Entry Officer') ? 'Digitization Support' : 'Your FRA Assistant'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-card border border-border rounded-tl-none shadow-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-70">
                                            Sources: {msg.sources.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75" />
                                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-border bg-card rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about FRA..."
                                className="flex-1 p-2 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center w-14 h-14"
            >
                {isOpen ? '✕' :
                    user?.roles.includes('Verification Officer') ? '⚖️' :
                        user?.roles.includes('Approving Authority') ? '🛡️' :
                            user?.roles.includes('Scheme Admin') ? '💼' :
                                user?.roles.includes('Super Admin') ? '👁️' :
                                    user?.roles.includes('Data Entry Officer') ? '⌨️' : '🤖'}
            </button>
        </div>
    );
}
