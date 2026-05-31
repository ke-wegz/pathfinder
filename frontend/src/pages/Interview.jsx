import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    MessageCircle,
    Send,
    Info,
    Loader,
    Sparkles,
    CheckCircle,
    BookOpen,
    ArrowRight,
    Compass,
    Award,
    History,
    Plus,
    Menu,
    X
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Interview = () => {
    const { t } = useTranslation();
    const { profile, goals, setRecommendations, loading: authLoading, user } = useAuth();

    // Past Sessions & Navigation States
    const [sessions, setSessions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Active Session States
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [sessionId, setSessionId] = useState(null);
    const [phase, setPhase] = useState('questioning');
    const [questionCount, setQuestionCount] = useState(0);
    const [questionLimit, setQuestionLimit] = useState(6);

    const [timeline, setTimeline] = useState(null);
    const [recommendationCount, setRecommendationCount] = useState(null);

    const [isComplete, setIsComplete] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isLoading && inputRef.current && phase !== 'limit_reached') {
            inputRef.current.focus();
        }
    }, [isLoading, phase]);

    const goalsDoneCount = useMemo(() => {
        return (goals || []).filter((g) => g.completed).length;
    }, [goals]);

    // Format createdAt timestamps safely
    const formatSessionDate = (session) => {
        try {
            let dateObj = null;
            if (session.createdAt) {
                if (typeof session.createdAt.toDate === 'function') {
                    dateObj = session.createdAt.toDate();
                } else if (session.createdAt._seconds) {
                    dateObj = new Date(session.createdAt._seconds * 1000);
                } else {
                    dateObj = new Date(session.createdAt);
                }
            }
            if (!dateObj || isNaN(dateObj.getTime())) {
                return t('Recent Session', 'Recent Session');
            }
            return dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return t('Recent Session', 'Recent Session');
        }
    };

    // Load list of past sessions
    const fetchSessions = async () => {
        try {
            const res = await api.get('/interview/sessions');
            const data = res?.data?.data || res?.data || [];
            setSessions(data);
        } catch (e) {
            console.error('Failed to load past sessions:', e);
        }
    };

    // Initialize: load latest past session or start new if none
    const initializeInterview = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/interview/sessions');
            const data = res?.data?.data || res?.data || [];
            setSessions(data);

            if (data.length > 0) {
                // Auto-load most recent session
                await loadSession(data[0].sessionId);
            } else {
                // Auto-start new session
                await start();
            }
        } catch (e) {
            console.error('Failed to initialize career interview:', e);
            await start();
        } finally {
            setIsLoading(false);
            setInitialized(true);
        }
    };

    useEffect(() => {
        if (!authLoading && profile && !initialized) {
            initializeInterview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, profile, initialized]);

    // Start a clean new session
    const start = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/interview/start');
            const data = res?.data?.data || res?.data;

            const nextSessionId = data?.sessionId;
            const firstQuestion = data?.question;

            if (!nextSessionId || !firstQuestion) {
                throw new Error('Invalid start response from server');
            }

            setSessionId(nextSessionId);
            setPhase(data.phase || 'setup_limit');
            setQuestionCount(0);
            setQuestionLimit(10);
            setIsComplete(false);
            setTimeline(null);
            setRecommendationCount(null);

            setMessages([
                {
                    role: 'assistant',
                    content: firstQuestion,
                },
            ]);

            await fetchSessions();
        } catch (e) {
            console.error(e);
            setMessages([
                {
                    role: 'assistant',
                    content: t('Sorry — I couldn\'t start your interview. Please refresh and try again.'),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Force start a new interview from UI button
    const startNewInterview = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await api.post('/interview/start');
            const data = res?.data?.data || res?.data;

            const nextSessionId = data?.sessionId;
            const firstQuestion = data?.question;

            if (!nextSessionId || !firstQuestion) {
                throw new Error('Invalid start response from server');
            }

            setSessionId(nextSessionId);
            setPhase(data.phase || 'setup_limit');
            setQuestionCount(0);
            setQuestionLimit(10);
            setIsComplete(false);
            setTimeline(null);
            setRecommendationCount(null);

            setMessages([
                {
                    role: 'assistant',
                    content: firstQuestion,
                },
            ]);

            // Optimistically prepend to sessions list
            const placeholder = {
                sessionId: nextSessionId,
                completed: false,
                phase: data.phase || 'setup_limit',
                questionCount: 0,
                questionLimit: 10,
                createdAt: new Date().toISOString(),
                messages: [{ role: 'assistant', content: firstQuestion }]
            };
            setSessions((prev) => [placeholder, ...prev]);
            
            // Re-fetch formally
            fetchSessions();
            setIsSidebarOpen(false); // close drawer on mobile
        } catch (e) {
            console.error('Failed to start new interview:', e);
            setMessages([
                {
                    role: 'assistant',
                    content: t('Sorry — I couldn\'t start your interview. Please refresh and try again.'),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load existing session details
    const loadSession = async (sId) => {
        if (sId === sessionId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/interview/session/${sId}`);
            const data = res?.data?.data || res?.data;

            if (!data) throw new Error('Invalid session response');

            setSessionId(data.sessionId || sId);
            setPhase(data.phase || 'questioning');
            setQuestionCount(data.questionCount || 0);
            setQuestionLimit(data.questionLimit || 10);
            setIsComplete(data.completed || false);
            setTimeline(data.timeline || null);
            setRecommendationCount(data.recommendationCount || null);
            setMessages(data.messages || []);
            setIsSidebarOpen(false); // close mobile sidebar drawer
        } catch (e) {
            console.error('Failed to load session details:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAsk = async (text) => {
        if (!sessionId) return;

        const trimmed = text.trim();
        if (!trimmed) return;
        if (isLoading) return;
        if (isComplete) return;

        setIsLoading(true);

        setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
        setInput('');

        try {
            const res = await api.post('/interview/message', { sessionId, message: trimmed, answer: trimmed });
            const data = res?.data?.data || res?.data;

            if (!data) throw new Error('Invalid response from /interview/message');

            if (data.complete) {
                setIsComplete(true);
                if (data.question) {
                    setMessages((prev) => [...prev, { role: 'assistant', content: data.question }]);
                }

                // Update active session locally inside list
                setSessions((prev) =>
                    prev.map((s) => (s.sessionId === sessionId ? { ...s, completed: true, phase: 'complete' } : s))
                );

                // Generate recommendations based on Firestore session fields (timeline + recommendationCount).
                api.post('/recommendations/generate', { sessionId })
                    .then((genRes) => {
                        const recData = genRes?.data?.data || genRes?.data;
                        const recommendationsArray = recData?.recommendations || [];
                        const fallback = Array.isArray(recommendationsArray) && recommendationsArray.length > 0 ? recommendationsArray : (recData || []);
                        setRecommendations(fallback);
                        localStorage.setItem('pathfinder_recommendations', JSON.stringify(fallback));
                        window.location.href = '/paths';
                    })
                    .catch((e) => {
                        console.error('Failed generating recommendations:', e);
                        setMessages((prev) => [
                            ...prev,
                            { role: 'assistant', content: t('There was an error generating your recommendations. Please check your backend console logs to see what failed!') }
                        ]);
                    });

                return;
            }

            // Normal next question
            if (typeof data.question !== 'string') {
                throw new Error('Missing "question" from message response');
            }

            if (typeof data.phase === 'string') setPhase(data.phase);
            if (typeof data.questionCount === 'number') setQuestionCount(data.questionCount);
            if (typeof data.questionLimit === 'number') setQuestionLimit(data.questionLimit);

            if (data.phase === 'timeline') setTimeline(trimmed);
            if (data.phase === 'rec_count') {
                const extracted = Number(String(trimmed).replace(/[^0-9]/g, ''));
                const clamped = Number.isFinite(extracted) ? Math.max(1, Math.min(5, extracted)) : 3;
                setRecommendationCount(clamped);
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: data.question }]);

            // Keep past sessions array state fully synced in local view
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.sessionId === sessionId) {
                        return {
                            ...s,
                            phase: data.phase || s.phase,
                            questionCount: typeof data.questionCount === 'number' ? data.questionCount : s.questionCount,
                            questionLimit: typeof data.questionLimit === 'number' ? data.questionLimit : s.questionLimit
                        };
                    }
                    return s;
                })
            );
        } catch (e) {
            console.error(e);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Something went wrong while processing your answer. Try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendText = () => handleAsk(input);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendText();
        }
    };

    // Buttons for handshake phases
    const handshakeButtons = useMemo(() => {
        if (phase !== 'limit_reached') return null;
        return (
            <div className="mt-3 flex flex-wrap gap-3 justify-center">
                <div className="tooltip-container">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAsk('Continue')}
                        className="p-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-50 flex items-center justify-center shadow-sm"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <span className="tooltip-text">{t('Continue with 5 more questions')}</span>
                </div>
                <div className="tooltip-container">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAsk('Done')}
                        className="p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition disabled:opacity-50 flex items-center justify-center shadow-sm"
                    >
                        <Compass size={20} />
                    </button>
                    <span className="tooltip-text">{t('Get my recommendations')}</span>
                </div>
            </div>
        );
    }, [phase, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    const headerSubtitle = useMemo(() => {
        if (phase === 'setup_limit') return 'How many questions would you like? (5-20)';
        if (phase === 'limit_reached') return 'Question limit reached — choose Continue or Done.';
        if (phase === 'timeline') return 'Tell me your preferred timeline (e.g., 6-12 months).';
        if (phase === 'rec_count') return 'Choose how many recommendations you want (1-5).';
        if (phase === 'complete') return 'Finishing up...';
        return 'Just chat naturally — I’ll guide the next step.';
    }, [phase]);

    if (authLoading || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader size={40} className="animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{t('Loading your profile...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden">
            {/* Sidebar Mobile Overlay Backdrop */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                />
            )}

            {/* Premium Glassmorphic Left Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white shadow-sm">
                            <History size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white leading-tight">
                                {t('Interviews', 'Interviews')}
                            </h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                {t('Chat history & sessions', 'Chat history & sessions')}
                            </p>
                        </div>
                    </div>
                    {/* Close Mobile Drawer */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Primary Action Button to Start Fresh Session */}
                <div className="p-4">
                    <button
                        onClick={startNewInterview}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                    >
                        <Plus size={18} className="stroke-[2.5px]" />
                        <span>{t('New Interview', 'New Interview')}</span>
                    </button>
                </div>

                {/* Sidebar Sessions History List */}
                <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 custom-scrollbar">
                    {sessions.length === 0 ? (
                        <div className="py-12 px-4 text-center">
                            <MessageCircle size={32} className="mx-auto text-gray-400 dark:text-gray-600 mb-2 opacity-50" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('No past interviews found.', 'No past interviews found.')}
                            </p>
                        </div>
                    ) : (
                        sessions.map((sess) => {
                            const isSelected = sess.sessionId === sessionId;
                            const isSessComplete = sess.completed || sess.phase === 'complete';
                            return (
                                <button
                                    key={sess.sessionId}
                                    onClick={() => loadSession(sess.sessionId)}
                                    disabled={isLoading}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 group relative overflow-hidden ${
                                        isSelected
                                            ? 'bg-primary-50/70 dark:bg-primary-950/20 border-primary-500/50 dark:border-primary-500/40 text-primary-900 dark:text-primary-100 shadow-sm'
                                            : 'bg-white dark:bg-gray-900 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {/* Selected indicators */}
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-600 to-secondary-600 rounded-r" />
                                    )}

                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold leading-none">
                                            <MessageCircle size={14} className={isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'} />
                                            <span className="truncate max-w-[140px]">
                                                {formatSessionDate(sess)}
                                            </span>
                                        </div>
                                        {/* Status badge */}
                                        <span
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full leading-none ${
                                                isSessComplete
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                            }`}
                                        >
                                            {isSessComplete ? t('Complete', 'Complete') : t('Active', 'Active')}
                                        </span>
                                    </div>

                                    {/* Progress counters */}
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {sess.phase === 'setup_limit'
                                            ? t('Setting limit...', 'Setting limit...')
                                            : isSessComplete
                                            ? t('Recommendations ready', 'Recommendations ready')
                                            : t('Questions: {{count}}/{{limit}}', 'Questions: {{count}}/{{limit}}', {
                                                  count: sess.questionCount || 0,
                                                  limit: sess.questionLimit || 10,
                                              })}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main Interactive Chat Panel */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header bar */}
                    <div className="flex items-center justify-between mb-6">
                        {/* Mobile Drawer Trigger */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition shadow-sm"
                        >
                            <Menu size={20} />
                            <span className="text-xs font-semibold ml-2">{t('History', 'History')}</span>
                        </button>

                        <div className="hidden lg:block w-24" /> {/* Spacer spacer */}

                        <div className="text-center flex-1">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 mb-2 shadow-md">
                                <MessageCircle size={24} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                {t('AI Career Interview', 'AI Career Interview')}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t(headerSubtitle, headerSubtitle)}
                            </p>
                        </div>

                        <div className="w-24 hidden lg:block" /> {/* Spacer spacer */}
                    </div>

                    {/* Chat Board Layout */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center flex-shrink-0 mr-3 mt-1 shadow-sm">
                                            <Sparkles size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center mr-3 mt-1 shadow-sm">
                                        <Sparkles size={14} className="text-white" />
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1.5 py-1">
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer Panel */}
                        {!isComplete ? (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                                {handshakeButtons}
                                {/* Hide text input on handshake selections */}
                                {phase !== 'limit_reached' && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            sendText();
                                        }}
                                        className="flex gap-3 mt-2"
                                    >
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={isLoading}
                                            placeholder={
                                                phase === 'setup_limit'
                                                    ? t('Enter a number from 5 to 20', 'Enter a number from 5 to 20')
                                                    : phase === 'timeline'
                                                    ? t('e.g., 6 months', 'e.g., 6 months')
                                                    : phase === 'rec_count'
                                                    ? t('Enter a number from 1 to 5', 'Enter a number from 1 to 5')
                                                    : t('Type your answer...', 'Type your answer...')
                                            }
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 outline-none text-gray-900 dark:text-white disabled:opacity-50 shadow-inner"
                                        />
                                        <div className="tooltip-container">
                                            <button
                                                type="submit"
                                                disabled={isLoading || !input.trim()}
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center shadow-md"
                                            >
                                                {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                                            </button>
                                            <span className="tooltip-text">{t('Send Message', 'Send Message')}</span>
                                        </div>
                                    </form>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center font-medium">
                                    {t('Press Enter to send • You can answer freely — I’ll guide the next step.', 'Press Enter to send • You can answer freely — I’ll guide the next step.')}
                                </p>

                                <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                    {['questioning', 'limit_reached'].includes(phase) ? (
                                        <>
                                            {t('Questions: {{count}}/{{limit}}', 'Questions: {{count}}/{{limit}}', {
                                                count: questionCount,
                                                limit: questionLimit,
                                            })}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-6 text-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800/50 rounded-2xl p-6 shadow-sm">
                                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2 flex items-center justify-center gap-2">
                                        {t('Interview Complete!')} <Award size={28} className="text-green-500 animate-pulse" />
                                    </h2>
                                    <p className="text-green-700 dark:text-green-300 mb-4">{t('Your personalized career recommendations are ready!', 'Your personalized career recommendations are ready!')}</p>
                                    <div className="flex gap-4 justify-center">
                                        <div className="tooltip-container">
                                            <a
                                                href="/paths"
                                                className="w-12 h-12 inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Sparkles size={22} />
                                            </a>
                                            <span className="tooltip-text">{t('View Your Recommendations', 'View Your Recommendations')}</span>
                                        </div>
                                        <div className="tooltip-container">
                                            <a
                                                href="/resources"
                                                className="w-12 h-12 inline-flex items-center justify-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all text-gray-700 dark:text-gray-300 shadow-sm"
                                            >
                                                <BookOpen size={22} />
                                            </a>
                                            <span className="tooltip-text">{t('Browse Learning Resources', 'Browse Learning Resources')}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-4 font-semibold">{t('Saved in the Career Paths tab', 'Saved in the Career Paths tab')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 bg-primary-50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/50 rounded-2xl p-4 shadow-sm">
                        <div className="flex gap-3">
                            <Info size={20} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-primary-900 dark:text-primary-200 mb-1">{t('Just Chat Naturally', 'Just Chat Naturally')}</h3>
                                <p className="text-xs text-primary-800 dark:text-primary-300 leading-relaxed font-medium">
                                    {t('Answer each prompt. When you reach the question limit, choose Continue or Done. Then pick your timeline and recommendation count.', 'Answer each prompt. When you reach the question limit, choose Continue or Done. Then pick your timeline and recommendation count.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;
