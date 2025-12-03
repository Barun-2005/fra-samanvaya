import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { MessageSquare, Send, X, Scale, FileText, Shield, Briefcase, Eye, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FraBot() {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Determine persona based on role - NO EMOJIS, USE LUCIDE ICONS
    const getPersona = () => {
        if (user?.roles.includes('Verification Officer')) return {
            greeting: 'Hello Officer. I can help you find precedents, verify evidence, or cite specific Act sections.',
            context: 'You are a Legal Assistant helping a Verification Officer. Focus on evidence, precedents, and legal sections of FRA 2006.',
            title: 'Legal Assistant',
            Icon: Scale,
            subtitle: 'Precedent Search & Evidence Verification'
        };
        if (user?.roles.includes('Data Entry Officer')) return {
            greeting: 'Hello. I can assist with form filling, digitizing records, or translating documents.',
            context: 'You are a Data Assistant helping a Data Entry Officer. Focus on accuracy, form fields, and translating handwritten documents.',
            title: 'Data Assistant',
            Icon: FileText,
            subtitle: 'Digitization & Form Assistance'
        };
        if (user?.roles.includes('Approving Authority')) return {
            greeting: 'Greetings. I can assist with risk assessment, drafting orders, or clarifying legal ambiguities.',
            context: 'You are a Legal Consultant helping an Approving Authority. Focus on risk mitigation, legal validity, and drafting title deeds.',
            title: 'Legal Consultant',
            Icon: Shield,
            subtitle: 'Risk Assessment & Legal Drafting'
        };
        if (user?.roles.includes('Scheme Admin')) return {
            greeting: 'Hello. I can help you match schemes to villages or analyze beneficiary demographics.',
            context: 'You are a Policy Expert helping a Scheme Admin. Focus on government schemes, eligibility criteria, and convergence opportunities.',
            title: 'Policy Expert',
            Icon: Briefcase,
            subtitle: 'Scheme Matching & Beneficiary Analysis'
        };
        if (user?.roles.includes('Super Admin')) return {
            greeting: 'System Online. I can help you analyze anomalies, monitor system health, or query user data.',
            context: 'You are a System Administrator AI. Focus on system health, security anomalies, and user management metrics.',
            title: 'God\'s Eye',
            Icon: Eye,
            subtitle: 'Anomaly Detection & System Health'
        };
        return {
            greeting: 'Namaste. I am the FRA Samanvay Assistant. I can help you understand the Forest Rights Act, check eligibility, or guide you through the claim process.',
            context: 'You are a helpful government assistant explaining the Forest Rights Act 2006 to a citizen. Keep answers simple, respectful, and clear. Do not use emojis.',
            title: 'FRA Assistant',
            Icon: Bot,
            subtitle: 'Forest Rights Act Guide'
        };
    };

    const persona = getPersona();
    const PersonaIcon = persona.Icon;

    // Initialize with greeting when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', text: persona.greeting }]);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Map User Role to Agent Role
            // Map User Role to Agent Role
            let agentRole = 'citizen'; // Default to Mitra

            if (user?.roles.includes('Data Entry Operator') || user?.roles.includes('data_entry')) {
                agentRole = 'data_entry';
            } else if (user?.roles.includes('NGO Member') || user?.roles.includes('ngo')) {
                agentRole = 'ngo';
            } else if (user?.roles.some(r => ['Verification Officer', 'Approving Authority', 'Scheme Admin', 'Super Admin'].includes(r))) {
                agentRole = 'official'; // Vidhi
            } else if (user?.roles.includes('Field Officer')) {
                agentRole = 'field_officer'; // Satark
            }

            // Use user ID as session ID if logged in, otherwise use a persistent random ID for this session
            // Append role to session ID to prevent history contamination between roles
            const baseSessionId = user?.id || 'guest-' + new Date().toISOString().split('T')[0];
            const sessionId = `${baseSessionId}-${agentRole}`;

            const response = await api.post('/chat', {
                message: input,
                role: agentRole,
                sessionId: sessionId
            });

            const botMessage = {
                role: 'assistant',
                text: response.data.response,
                // sources: response.data.sources // LangChain might not return sources in the same way yet
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: 'Sorry, I encountered an error. Please try again.'
            }]);
            toast.error('Failed to get response from AI');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Hide on login/register pages - MOVED HERE TO AVOID HOOK ERROR
    const hiddenRoutes = ['/login', '/register', '/signup', '/'];
    if (hiddenRoutes.includes(router.pathname)) return null;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-96 z-[9999]">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col h-[500px] border border-slate-200 dark:border-slate-700">
                        {/* Header - PROFESSIONAL WITH LUCIDE ICON */}
                        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <PersonaIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{persona.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{persona.subtitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`rounded-lg p-3 max-w-xs ${message.role === 'user'
                                            ? 'bg-primary text-white rounded-br-none shadow-sm'
                                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        {message.sources && message.sources.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                                <p className="text-xs opacity-75">
                                                    Sources: {message.sources.map(s => s.title).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg rounded-bl-none p-3 max-w-xs shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - SEND BUTTON INSIDE INPUT */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-2 w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 min-w-0"
                                    placeholder="Type your question here..."
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary-hover focus:ring-4 focus:ring-primary/50 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
                    aria-label={`Open ${persona.title}`}
                    title={persona.title}
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}
        </>
    );
}
