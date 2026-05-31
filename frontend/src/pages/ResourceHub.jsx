import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import {
    Video, BookOpen, Wrench, MapPin, Star, Clock,
    Bookmark, ChevronRight, Search, Sparkles,
    Loader, School, GraduationCap, AlertCircle, ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Static data - never changes
const STATIC_RESOURCES = [
    { id: 1, type: 'Course', title: 'Career Development Fundamentals', provider: 'Coursera', duration: '4 weeks', rating: 4.7, description: 'Learn essential career planning skills', tags: ['Career', 'Planning'] },
    { id: 2, type: 'Book', title: 'Designing Your Life', provider: 'Bill Burnett', rating: 4.8, description: 'How to build a well-lived, joyful life', tags: ['Career', 'Life Design'] },
    { id: 3, type: 'Tool', title: 'LinkedIn Learning', provider: 'LinkedIn', description: 'Professional development courses', tags: ['Learning', 'Skills'] },
    { id: 4, type: 'Course', title: 'Communication Skills', provider: 'edX', duration: '6 weeks', rating: 4.6, description: 'Master professional communication', tags: ['Soft Skills'] }
];

const STATIC_CENTERS = [
    { id: 1, name: 'Local Community College', type: 'College', city: 'Your City', country: 'Your Country', description: 'Offers career development courses' }
];

const ResourceHub = () => {
    const { t } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('All Resources');
    const [resources, setResources] = useState(STATIC_RESOURCES);
    const [customResourcesLoaded, setCustomResourcesLoaded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [savedResources, setSavedResources] = useState([]);
    const [generating, setGenerating] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const filters = useMemo(() => ['All Resources', 'Courses', 'Books', 'Tools', 'Learning Centers', 'Saved'], []);

    const typeIcons = useMemo(() => ({
        'Course': Video,
        'Book': BookOpen,
        'Tool': Wrench,
        'Center': MapPin
    }), []);

    const typeColors = useMemo(() => ({
        'Course': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
        'Book': 'bg-green-100 dark:bg-green-900/30 text-green-600',
        'Tool': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
        'Center': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
    }), []);

    const generateCustomResources = useCallback(async () => {
        if (!searchTerm.trim() || generating) return;

        setGenerating(true);

        // Simulate API call with timeout (no actual API call to avoid loops)
        setTimeout(() => {
            if (mountedRef.current) {
                const newResources = [
                    { id: Date.now(), type: 'Course', title: `${searchTerm} Fundamentals`, provider: 'Online Learning', duration: '6 weeks', rating: 4.5, description: `Learn the basics of ${searchTerm}` },
                    { id: Date.now() + 1, type: 'Book', title: `Mastering ${searchTerm}`, provider: 'Expert Author', rating: 4.7, description: `Comprehensive guide to ${searchTerm}` }
                ];
                setResources(newResources);
                setGenerating(false);
            }
        }, 1000);
    }, [searchTerm, generating]);

    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            if (activeFilter === 'Saved') {
                return savedResources.includes(resource.title);
            }
            if (activeFilter !== 'All Resources' && resource.type !== activeFilter.slice(0, -1)) {
                return false;
            }
            if (searchTerm) {
                return resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    resource.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    resource.path?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });
    }, [resources, activeFilter, savedResources, searchTerm]);

    const groupedResources = useMemo(() => {
        if (!customResourcesLoaded) return {};
        return filteredResources.reduce((groups, resource) => {
            const key = resource.path || 'General Resources';
            if (!groups[key]) groups[key] = [];
            groups[key].push(resource);
            return groups;
        }, {});
    }, [filteredResources, customResourcesLoaded]);

    const toggleSave = useCallback((title) => {
        setSavedResources(prev =>
            prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
        );
    }, []);

    const getResourceUrl = useCallback((title, provider) => {
        const q = encodeURIComponent(`${title} ${provider}`);
        return `https://www.google.com/search?q=${q}`;
    }, []);

    const extractRecommendations = useCallback((data) => {
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
    }, []);

    const loadRecommendationResources = useCallback(async () => {
        try {
            const response = await api.get('/recommendations');
            const docs = response.data.data;
            const recs = extractRecommendations(docs);
            const pathResources = recs.flatMap((rec, idx) => {
                if (!Array.isArray(rec.resources)) return [];
                return rec.resources.map((resource, resourceIndex) => ({
                    id: `${rec.parentDocId || 'path'}-${rec.parentIndex ?? idx}-${resourceIndex}`,
                    type: resource.type || 'Course',
                    title: resource.name || resource.title || `${rec.title} Resource`,
                    provider: resource.provider || 'PathFinder AI',
                    duration: resource.duration || null,
                    rating: resource.rating || null,
                    description: resource.description || rec.reason || '',
                    tags: [rec.title || 'Career Path'],
                    path: rec.title || 'Career Path'
                }));
            });

            if (pathResources.length > 0) {
                setResources(pathResources);
                setCustomResourcesLoaded(true);
            }
        } catch (error) {
            console.error('Error loading recommendation resources:', error);
        }
    }, [extractRecommendations]);

    useEffect(() => {
        mountedRef.current = true;
        loadRecommendationResources();

        const onRecommendationsUpdated = () => {
            loadRecommendationResources();
        };

        const onStorageChange = (event) => {
            if (event.key === 'pathfinder_recommendations') {
                loadRecommendationResources();
            }
        };

        window.addEventListener('recommendationsUpdated', onRecommendationsUpdated);
        window.addEventListener('storage', onStorageChange);

        return () => {
            mountedRef.current = false;
            window.removeEventListener('recommendationsUpdated', onRecommendationsUpdated);
            window.removeEventListener('storage', onStorageChange);
        };
    }, [loadRecommendationResources]);

    const featuredResource = resources[0];

    // Don't log profile to avoid console spam
    // console.log('Profile in ResourceHub:', profile);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Resources')}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Learning Resources')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {customResourcesLoaded
                            ? t('Path-specific resources generated from your current career recommendations.')
                            : t('Curated courses, books, and tools for your career journey.')}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Search for any topic...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && generateCustomResources()}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="tooltip-container">
                            <button
                                onClick={generateCustomResources}
                                disabled={generating || !searchTerm.trim()}
                                className="p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center"
                                aria-label="Search resources"
                            >
                                {generating ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                            </button>
                            <span className="tooltip-text">{t('Search Resources')}</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeFilter === filter
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {t(filter)}
                        </button>
                    ))}
                </div>

                {/* Featured Resources */}
                {featuredResource && (
                    <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                                    <Star size={14} className="fill-current text-amber-300" /> {t('Featured')}
                                </span>
                                <h2 className="text-2xl font-bold mb-2">{featuredResource.title}</h2>
                                <p className="text-primary-100 mb-4">{featuredResource.description}</p>
                                <div className="flex items-center gap-6 text-sm mb-4">
                                    {featuredResource.duration && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {featuredResource.duration}
                                        </span>
                                    )}
                                    {featuredResource.rating && (
                                        <span className="flex items-center gap-1">
                                            <Star size={14} className="fill-current" />
                                            {featuredResource.rating}
                                        </span>
                                    )}
                                </div>
                                <div className="tooltip-container">
                                    <a
                                        href={getResourceUrl(featuredResource.title, featuredResource.provider)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                    <span className="tooltip-text text-gray-900">{t('Start Learning')}</span>
                                </div>
                            </div>
                            <div className="w-full md:w-48 h-32 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center">
                                <BookOpen size={40} className="text-white/50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources Grid */}
                {customResourcesLoaded ? (
                    <div className="space-y-8">
                        {Object.entries(groupedResources).map(([path, resourcesForPath]) => (
                            <section key={path} className="space-y-4">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('Resources for:')} {path}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Tools and learning materials mapped to this recommendation.')}</p>
                                </div>
                                <div className="space-y-4">
                                    {resourcesForPath.map((resource) => {
                                        const Icon = typeIcons[resource.type] || BookOpen;
                                        const colorClass = typeColors[resource.type] || 'bg-gray-100 text-gray-600';
                                        const isSaved = savedResources.includes(resource.title);

                                        return (
                                            <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                                                <div className="flex gap-4">
                                                    <div className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon size={32} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <div>
                                                                <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded mb-2">
                                                                    {resource.type}
                                                                </span>
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{resource.title}</h3>
                                                                {resource.provider && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('by')} {resource.provider}</p>
                                                                )}
                                                            </div>
                                                            <div className="tooltip-container">
                                                                <button onClick={() => toggleSave(resource.title)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                    <Bookmark size={18} className={isSaved ? 'fill-primary-600 text-primary-600' : 'text-gray-400'} />
                                                                </button>
                                                                <span className="tooltip-text">{isSaved ? t('Saved') : t('Save Resource')}</span>
                                                            </div>
                                                        </div>

                                                        {resource.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                                                        )}

                                                        <div className="tooltip-container">
                                                            <a
                                                                href={getResourceUrl(resource.title, resource.provider)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center"
                                                            >
                                                                <ExternalLink size={18} />
                                                            </a>
                                                            <span className="tooltip-text">{t('View Resource')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredResources.map((resource) => {
                            const Icon = typeIcons[resource.type] || BookOpen;
                            const colorClass = typeColors[resource.type] || 'bg-gray-100 text-gray-600';
                            const isSaved = savedResources.includes(resource.title);

                            return (
                                <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4">
                                        <div className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <Icon size={32} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded mb-2">
                                                        {resource.type}
                                                    </span>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{resource.title}</h3>
                                                    {resource.provider && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('by')} {resource.provider}</p>
                                                    )}
                                                    {resource.path && (
                                                        <p className="text-xs text-primary-600 dark:text-primary-300 mt-1">{t('Recommended for:')} {resource.path}</p>
                                                    )}
                                                </div>
                                                <div className="tooltip-container">
                                                    <button onClick={() => toggleSave(resource.title)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <Bookmark size={18} className={isSaved ? 'fill-primary-600 text-primary-600' : 'text-gray-400'} />
                                                    </button>
                                                    <span className="tooltip-text">{isSaved ? t('Saved') : t('Save Resource')}</span>
                                                </div>
                                            </div>

                                            {resource.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                                            )}

                                            <div className="tooltip-container">
                                                <a
                                                    href={getResourceUrl(resource.title, resource.provider)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                                <span className="tooltip-text">{t('View Resource')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceHub;