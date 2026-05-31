import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, Info, Loader, Sparkles, CheckCircle, BookOpen, ArrowRight, Compass, Award } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Interview = () => {
    const { t } = useTranslation();
    const { profile, goals, setRecommendations, loading: authLoading, user } = useAuth();

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

    const buildUserTextFallback = () => {
        const name = profile?.name || 'Unknown';
        const location = profile?.location || 'Unknown';
        const skills = Array.isArray(profile?.skills) ? profile.skills.join(', ') : 'N/A';
        return `User: ${name}\nLocation: ${location}\nSkills: ${skills}\nGoals completed: ${goalsDoneCount}`;
    };

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

            setInitialized(true);
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

    useEffect(() => {
        if (!authLoading && profile && !initialized) start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, profile, initialized]);

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

                // Generate recommendations based on Firestore session fields (timeline + recommendationCount).
                // NOTE: backend route expects { sessionId }.
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

            // Normal next question / prompt from backend
            if (typeof data.question !== 'string') {
                throw new Error('Missing "question" from message response');
            }

            // Update phase + counters if provided by backend
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

    // Buttons for the handshake phases.
    // The backend prompt will instruct what the user should answer; these buttons set a clear intent.
    const handshakeButtons = useMemo(() => {
        if (phase !== 'limit_reached') return null;
        return (
            <div className="mt-3 flex flex-wrap gap-3 justify-center">
                <div className="tooltip-container">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAsk('Continue')}
                        className="p-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-50 flex items-center justify-center"
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
                        className="p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition disabled:opacity-50 flex items-center justify-center"
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 mb-4">
                        <MessageCircle size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('AI Career Interview', 'AI Career Interview')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{t(headerSubtitle, headerSubtitle)}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                                        <Sparkles size={14} className="text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-3 mt-1">
                                        <span className="text-xs font-bold">
                                            {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center mr-3 mt-1">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {!isComplete ? (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            {handshakeButtons}
                            {/* Hide textbox on handshake phases that should be answered via buttons */}
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
                                                ? 'Enter a number from 5 to 20'
                                                : phase === 'timeline'
                                                    ? 'e.g., 6 months'
                                                    : phase === 'rec_count'
                                                        ? 'Enter a number from 1 to 5'
                                                        : 'Type your answer...'
                                        }
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                                    />
                                    <div className="tooltip-container">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                                        </button>
                                        <span className="tooltip-text">{t('Send Message')}</span>
                                    </div>
                                </form>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                Press Enter to send • You can answer freely — I’ll guide the next step.
                            </p>

                            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                {['questioning', 'limit_reached'].includes(phase) ? (
                                    <>
                                        Questions: {questionCount}/{questionLimit}
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-6 text-center">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2 flex items-center justify-center gap-2">
                                    {t('Interview Complete!')} <Award size={28} className="text-green-500 animate-pulse" />
                                </h2>
                                <p className="text-green-700 dark:text-green-300 mb-4">{t('Your personalized career recommendations are ready!', 'Your personalized career recommendations are ready!')}</p>
                                <div className="flex gap-4 justify-center">
                                    <div className="tooltip-container">
                                        <a
                                            href="/paths"
                                            className="w-12 h-12 inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all hover:scale-105"
                                        >
                                            <Sparkles size={22} />
                                        </a>
                                        <span className="tooltip-text">{t('View Your Recommendations')}</span>
                                    </div>
                                    <div className="tooltip-container">
                                        <a
                                            href="/resources"
                                            className="w-12 h-12 inline-flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 rounded-xl transition-all text-gray-700 dark:text-gray-300"
                                        >
                                            <BookOpen size={22} />
                                        </a>
                                        <span className="tooltip-text">{t('Browse Learning Resources')}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-4">{t('Saved in the Career Paths tab', 'Saved in the Career Paths tab')}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                    <div className="flex gap-3">
                        <Info size={20} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-1">{t('Just Chat Naturally')}</h3>
                            <p className="text-sm text-primary-800 dark:text-primary-200">
                                {t('Answer each prompt. When you reach the question limit, choose Continue or Done. Then pick your timeline and recommendation count.')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;
