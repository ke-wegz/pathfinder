import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Zap,
    Bookmark,
    ChevronRight,
    Search,
    Briefcase,
    RefreshCw,
    ExternalLink,
    CheckCircle,
    Loader,
    DollarSign,
    MapPin,
    Trash2,
    Eye,
    EyeOff,
    FileDown,
} from 'lucide-react';

import api from '../services/api';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import {
    createPdfContainer,
    escapeHtml,
    needsArabicPdf,
    removePdfContainer,
    saveElementAsPdf,
} from '../utils/pdfExport';

const CareerPaths = () => {
    const { t, i18n } = useTranslation();
    const { profile, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState(t('All Industries'));
    const [sortBy, setSortBy] = useState('match');
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [recs, setRecs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [deletingRec, setDeletingRec] = useState(null);

    const industries = [
        t('All Industries'),
        t('Technology'),
        t('Healthcare'),
        t('Finance'),
        t('Education'),
        t('Creative'),
        t('Marketing'),
        t('Sales'),
        t('Management'),
    ];

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/recommendations');
                const recsArray = extractRecommendations(res.data.data);

                if (recsArray.length > 0) {
                    setRecs(recsArray);
                    localStorage.setItem('pathfinder_recommendations', JSON.stringify(recsArray));
                } else {
                    const saved = localStorage.getItem('pathfinder_recommendations');
                    if (saved) {
                        const savedRecs = JSON.parse(saved);
                        if (savedRecs.length > 0) setRecs(savedRecs);
                    }
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                const saved = localStorage.getItem('pathfinder_recommendations');
                if (saved) {
                    try {
                        const savedRecs = JSON.parse(saved);
                        if (savedRecs.length > 0) setRecs(savedRecs);
                    } catch (e) { }
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [user]);

    const refreshRecommendations = async () => {
        if (refreshing || !user) return;

        setRefreshing(true);

        try {
            const res = await api.get('/recommendations');
            const recsArray = extractRecommendations(res.data.data);

            if (recsArray.length > 0) {
                setRecs(recsArray);
                localStorage.setItem('pathfinder_recommendations', JSON.stringify(recsArray));
            }
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatSalaryRange = (salaryRange) => {
        if (!salaryRange) return '';
        if (typeof salaryRange === 'string') return salaryRange;
        if (typeof salaryRange === 'object') {
            if (salaryRange.min !== undefined && salaryRange.max !== undefined) {
                const currency = salaryRange.currency ? `${salaryRange.currency} ` : '';
                return `${currency}${salaryRange.min} - ${salaryRange.max}`;
            }
            return JSON.stringify(salaryRange);
        }
        return String(salaryRange);
    };

    const filteredRecs = recs.filter((rec) => {
        const matchesSearch =
            rec.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rec.skills && rec.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesSearch;
    });

    const sortedRecs = [...filteredRecs].sort((a, b) => {
        if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === 'salary') {
            const aSalary = parseInt(formatSalaryRange(a.salaryRange).split('-')[1]?.replace(/[^0-9]/g, '') || 0);
            const bSalary = parseInt(formatSalaryRange(b.salaryRange).split('-')[1]?.replace(/[^0-9]/g, '') || 0);
            return bSalary - aSalary;
        }
        return 0;
    });

    const toggleSave = (recId) => {
        if (savedJobs.includes(recId)) {
            setSavedJobs(savedJobs.filter((id) => id !== recId));
        } else {
            setSavedJobs([...savedJobs, recId]);
        }
    };

    const getCompanySearchUrl = (companyName, location) => {
        const q = encodeURIComponent(`${companyName} ${location} careers jobs`);
        return `https://www.google.com/search?q=${q}`;
    };

    const getResourceUrl = (resourceName, provider) => {
        const q = encodeURIComponent(`${resourceName} ${provider} course`);
        return `https://www.google.com/search?q=${q}`;
    };

    const formatRoadmapForPdf = (roadmap) => {
        // Current UI expects roadmap: string[].
        // New backend may return roadmap: { totalDuration, steps: [...] }.
        if (!roadmap) return [];

        if (Array.isArray(roadmap)) {
            return roadmap.map((s) => String(s));
        }

        if (typeof roadmap === 'object' && roadmap.steps && Array.isArray(roadmap.steps)) {
            return roadmap.steps.map((step, idx) => {
                const title = step.title ? String(step.title) : t('Step {{count}}', { count: idx + 1 });
                const duration = step.duration ? ` (${String(step.duration)})` : '';
                return `${idx + 1}. ${title}${duration}`;
            });
        }

        return [String(roadmap)];
    };

    const extractRecommendations = (data) => {
        if (!data) return [];

        const results = [];

        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (!item || typeof item !== 'object') return;

                if (Array.isArray(item.recommendations)) {
                    item.recommendations.forEach((rec, idx) => {
                        if (!rec || typeof rec !== 'object') return;
                        results.push({
                            ...rec,
                            parentDocId: item.recId || item.parentDocId || null,
                            parentIndex: idx
                        });
                    });
                } else {
                    results.push(item);
                }
            });
        } else if (typeof data === 'object') {
            if (Array.isArray(data.recommendations)) {
                data.recommendations.forEach((rec, idx) => {
                    if (!rec || typeof rec !== 'object') return;
                    results.push({
                        ...rec,
                        parentDocId: data.recId || data.parentDocId || null,
                        parentIndex: idx
                    });
                });
            } else {
                results.push(data);
            }
        }

        return results;
    };

    const deleteRecommendation = async (parentDocId, parentIndex) => {
        if (!user || !parentDocId || parentIndex == null) return;

        const confirmed = window.confirm(
            t('Remove this recommendation and its resources?')
        );
        if (!confirmed) return;

        setDeletingRec(`${parentDocId}-${parentIndex}`);
        try {
            await api.delete(`/recommendations/${parentDocId}/entry/${parentIndex}`);
            const updated = recs.filter(
                (rec) => !(rec.parentDocId === parentDocId && rec.parentIndex === parentIndex)
            );
            setRecs(updated);
            localStorage.setItem('pathfinder_recommendations', JSON.stringify(updated));
            window.dispatchEvent(new Event('recommendationsUpdated'));
        } catch (error) {
            console.error('Error deleting recommendation:', error);
        } finally {
            setDeletingRec(null);
        }
    };

    const clearAllRecommendations = async () => {
        if (!user) return;

        const confirmed = window.confirm(
            t('This will delete all your saved recommendations. Do you want to continue?')
        );
        if (!confirmed) return;

        setClearing(true);
        try {
            await api.delete('/recommendations');
            setRecs([]);
            localStorage.removeItem('pathfinder_recommendations');
            window.dispatchEvent(new Event('recommendationsUpdated'));
        } catch (error) {
            console.error('Error clearing recommendations:', error);
        } finally {
            setClearing(false);
        }
    };

    const buildRoadmapPdfHtml = (rec, index, roadmapLines) => {
        const isRtl = i18n.language === 'ar';
        const title = rec.title
            ? `${index + 1}. ${escapeHtml(rec.title)}`
            : escapeHtml(t('Recommendation {{count}}', { count: index + 1 }));

        const reasonBlock = rec.reason
            ? `<p style="margin:0 0 16px;font-size:13px;color:#374151;">${escapeHtml(rec.reason)}</p>`
            : '';

        const stepsHtml =
            roadmapLines.length > 0
                ? `<h2 style="margin:0 0 10px;font-size:15px;">${escapeHtml(t('Roadmap'))}</h2>
                   <ul style="margin:0;padding-${isRtl ? 'right' : 'left'}:20px;">
                     ${roadmapLines
                         .map(
                             (line) =>
                                 `<li style="margin-bottom:8px;font-size:13px;">${escapeHtml(line)}</li>`
                         )
                         .join('')}
                   </ul>`
                : '';

        return `
            <h1 style="margin:0 0 8px;font-size:20px;">${escapeHtml(t('PathFinder AI - Roadmap'))}</h1>
            <p style="margin:0 0 20px;font-size:13px;color:#4b5563;">
              ${escapeHtml(
                  t('Personalized roadmap for {{title}}', {
                      title: rec.title || t('Recommendation {{count}}', { count: index + 1 }),
                  })
              )}
            </p>
            <h2 style="margin:0 0 8px;font-size:16px;">${title}</h2>
            ${reasonBlock}
            ${stepsHtml}
        `;
    };

    const downloadRoadmapPdfViaHtml = async (rec, index, filename) => {
        const roadmapLines = formatRoadmapForPdf(rec.roadmap);
        const isRtl = i18n.language === 'ar' || needsArabicPdf(rec.title, rec.reason, ...roadmapLines);
        const container = createPdfContainer(isRtl ? 'rtl' : 'ltr');

        try {
            container.innerHTML = buildRoadmapPdfHtml(rec, index, roadmapLines);
            await saveElementAsPdf(container, filename);
        } finally {
            removePdfContainer(container);
        }
    };

    const renderRoadmapInDoc = (doc, rec, index, startY) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 40;
        let y = startY;
        const maxWidth = pageWidth - marginLeft * 2;

        if (y > 760) {
            doc.addPage();
            y = 60;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const titleLine = rec.title ? `${index + 1}. ${rec.title}` : (rec.rank ? t('Career {{count}}', { count: rec.rank }) : t('Career Title'));
        doc.text(titleLine, marginLeft, y, { maxWidth });
        y += 18;

        if (rec.reason) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const reason = String(rec.reason);
            const lines = doc.splitTextToSize(reason, maxWidth);
            lines.forEach((line) => {
                if (y > 760) {
                    doc.addPage();
                    y = 60;
                }
                doc.text(line, marginLeft, y);
                y += 13;
            });
            y += 6;
        }

        const roadmapLines = formatRoadmapForPdf(rec.roadmap);
        if (roadmapLines.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(t('Roadmap'), marginLeft, y);
            y += 16;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            roadmapLines.forEach((line) => {
                if (y > 760) {
                    doc.addPage();
                    y = 60;
                }
                const safeLine = String(line);
                const wrapped = doc.splitTextToSize(safeLine, maxWidth);
                wrapped.forEach((w) => {
                    doc.text(`• ${w}`, marginLeft, y);
                    y += 12;
                });
                y += 4;
            });
        }

        return y + 12;
    };

    const downloadAllRoadmapsPdf = async () => {
        if (!sortedRecs || sortedRecs.length === 0) return;

        const allTexts = sortedRecs.flatMap((rec) => [
            rec.title,
            rec.reason,
            ...formatRoadmapForPdf(rec.roadmap),
        ]);
        if (i18n.language === 'ar' || needsArabicPdf(...allTexts)) {
            const isRtl = i18n.language === 'ar' || needsArabicPdf(...allTexts);
            const container = createPdfContainer(isRtl ? 'rtl' : 'ltr');
            try {
                const sections = sortedRecs
                    .map((rec, idx) => buildRoadmapPdfHtml(rec, idx, formatRoadmapForPdf(rec.roadmap)))
                    .join('<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />');
                container.innerHTML = `
                    <h1 style="margin:0 0 8px;font-size:20px;">${escapeHtml(t('PathFinder AI - Roadmaps'))}</h1>
                    <p style="margin:0 0 20px;font-size:13px;color:#4b5563;">${escapeHtml(t('Personalized career plans (AI interview)'))}</p>
                    ${sections}
                `;
                await saveElementAsPdf(container, 'pathfinder-roadmaps.pdf');
            } finally {
                removePdfContainer(container);
            }
            return;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        let y = 60;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(t('PathFinder AI - Roadmaps'), 40, y);
        y += 28;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(t('Personalized career plans (AI interview)'), 40, y);
        y += 24;

        sortedRecs.forEach((rec, idx) => {
            y = renderRoadmapInDoc(doc, rec, idx, y);
            if (idx < sortedRecs.length - 1 && y > 700) {
                doc.addPage();
                y = 60;
            }
        });

        doc.save('pathfinder-roadmaps.pdf');
    };

    const downloadRoadmapPdfForRec = async (rec, idx) => {
        if (!rec) return;

        const roadmapLines = formatRoadmapForPdf(rec.roadmap);
        const filename = `pathfinder-roadmap-${(rec.title || `recommendation-${idx + 1}`).replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;

        if (i18n.language === 'ar' || needsArabicPdf(rec.title, rec.reason, ...roadmapLines)) {
            await downloadRoadmapPdfViaHtml(rec, idx, filename);
            return;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        let y = 60;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(t('PathFinder AI - Roadmap'), 40, y);
        y += 28;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(t('Personalized roadmap for {{title}}', { title: rec.title || t('Recommendation {{count}}', { count: idx + 1 }) }), 40, y);
        y += 24;

        y = renderRoadmapInDoc(doc, rec, idx, y);

        doc.save(filename);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (recs.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('No Career Recommendations Yet')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {t('Complete your AI Interview to get personalized career recommendations based on your skills, interests, and goals.')}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/interview"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
                        >
                            {t('Start AI Interview')}
                            <ChevronRight size={18} />
                        </a>
                        <button
                            onClick={refreshRecommendations}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            {refreshing ? <Loader size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            {t('Refresh')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">
                            {t('Dashboard')}
                        </a>
                        <ChevronRight size={14} />
                        <span>{t('Recommendations')}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Your Career Matches')}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('Based on your skills, interests, and goals')}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {recs.length > 0 && (
                                <div className="tooltip-container">
                                    <button
                                        onClick={downloadAllRoadmapsPdf}
                                        className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
                                        aria-label="Download all roadmaps"
                                    >
                                        <FileDown size={18} />
                                    </button>
                                    <span className="tooltip-text">{t('Download All Roadmaps')}</span>
                                </div>
                            )}

                            <div className="tooltip-container">
                                <button
                                    onClick={refreshRecommendations}
                                    disabled={refreshing}
                                    className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-300"
                                    aria-label="Refresh recommendations"
                                >
                                    {refreshing ? <Loader size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                </button>
                                <span className="tooltip-text">{t('Refresh')}</span>
                            </div>

                            <div className="tooltip-container">
                                <button
                                    onClick={clearAllRecommendations}
                                    disabled={clearing || recs.length === 0}
                                    className="p-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors disabled:opacity-50"
                                    aria-label="Clear all recommendations"
                                >
                                    {clearing ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>
                                <span className="tooltip-text">{t('Clear All')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={18} className="text-gray-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder={t('Search careers...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="match">{t('Sort by Match')}</option>
                            <option value="salary">{t('Sort by Salary')}</option>
                        </select>
                    </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedRecs.map((rec, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className="relative h-32 bg-gradient-to-br from-primary-600 to-secondary-600 p-6">
                                <div className="flex justify-between items-start gap-3 w-full">
                                    <h3 className="text-2xl font-bold text-white flex-1 min-w-0 line-clamp-2">{rec.title}</h3>
                                    <div className="flex-shrink-0 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                        <Zap size={14} className="text-white" />
                                        <span className="text-white font-bold text-sm">{rec.matchScore || 85}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {rec.reason && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{rec.reason}</p>}

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('Salary Range')}</p>
                                        <p className="font-bold text-primary-600 text-sm">{formatSalaryRange(rec.salaryRange) || t('$70k - $100k')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('Growth')}</p>
                                        <p className="font-bold text-green-600 text-sm">{rec.growth || '+12%'}</p>
                                    </div>
                                </div>

                                {rec.skills && rec.skills.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('Key Skills')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.skills.slice(0, 4).map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 items-center justify-end">
                                    {/* View details */}
                                    <div className="tooltip-container">
                                        <button
                                            onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                                            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                                                expandedCard === index 
                                                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400' 
                                                    : 'border border-primary-300 text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {expandedCard === index ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <span className="tooltip-text">{expandedCard === index ? t('Hide Details') : t('View Details')}</span>
                                    </div>

                                    {/* Download Roadmap */}
                                    <div className="tooltip-container">
                                        <button
                                            onClick={() => downloadRoadmapPdfForRec(rec, index)}
                                            className="p-2.5 rounded-lg border border-primary-300 text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                                        >
                                            <FileDown size={18} />
                                        </button>
                                        <span className="tooltip-text">{t('Download Roadmap PDF')}</span>
                                    </div>

                                    {/* Delete recommendation */}
                                    <div className="tooltip-container">
                                        <button
                                            onClick={() => deleteRecommendation(rec.parentDocId, rec.parentIndex)}
                                            disabled={deletingRec === `${rec.parentDocId}-${rec.parentIndex}`}
                                            className="p-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {deletingRec === `${rec.parentDocId}-${rec.parentIndex}` ? (
                                                <Loader size={18} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                        <span className="tooltip-text">{t('Delete Recommendation')}</span>
                                    </div>

                                    {/* Bookmark */}
                                    <div className="tooltip-container">
                                        <button
                                            onClick={() => toggleSave(index)}
                                            className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                                                savedJobs.includes(index) 
                                                    ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-900/40 dark:border-primary-700 dark:text-primary-400' 
                                                    : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <Bookmark size={18} className={savedJobs.includes(index) ? 'fill-current' : ''} />
                                        </button>
                                        <span className="tooltip-text">{savedJobs.includes(index) ? t('Saved') : t('Save for Later')}</span>
                                    </div>
                                </div>
                            </div>

                            {expandedCard === index && (
                                <div className="border-t p-6 bg-gray-50 dark:bg-gray-900/50">
                                    {rec.roadmap && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('Roadmap')}</h4>
                                            <ol className="space-y-2">
                                                {formatRoadmapForPdf(rec.roadmap).map((stepLine, i) => (
                                                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="text-primary-600 font-bold">{i + 1}.</span>
                                                        <span>{stepLine.replace(/^\d+\.\s*/, '')}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {rec.localCompanies && rec.localCompanies.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                                                <MapPin size={14} /> {t('Local Companies')}
                                            </h4>
                                            <div className="space-y-2">
                                                {rec.localCompanies.map((company, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                                                    >
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {company.name} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({company.location})</span>
                                                        </span>
                                                        <div className="tooltip-container">
                                                            <a
                                                                href={getCompanySearchUrl(company.name, company.location)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all flex items-center justify-center"
                                                            >
                                                                <Search size={14} />
                                                            </a>
                                                            <span className="tooltip-text">{t('Search Jobs')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {rec.resources && (
                                        <div>
                                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('Resources')}</h4>
                                            <div className="space-y-2">
                                                {rec.resources.map((resource, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                                                    >
                                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            {resource.name} <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({resource.provider})</span>
                                                        </span>
                                                        <div className="tooltip-container">
                                                            <a
                                                                href={getResourceUrl(resource.name, resource.provider)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all flex items-center justify-center"
                                                            >
                                                                <ExternalLink size={14} />
                                                            </a>
                                                            <span className="tooltip-text">{t('Start Learning')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {sortedRecs.length === 0 && (
                    <div className="text-center py-12">
                        <Search size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No matches found')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t('Try adjusting your search or filter criteria')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerPaths;