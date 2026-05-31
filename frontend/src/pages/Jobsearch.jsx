import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
    Search, Briefcase, MapPin, DollarSign, Building,
    ExternalLink, ChevronRight, Filter, Star, Clock,
    TrendingUp, Bookmark, Share2, Calendar, Award,
    Linkedin, Globe, Mail, Phone, Palette, BarChart2,
    Laptop, Megaphone, Package, Clipboard, X, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JobSearch = () => {
    const { t } = useTranslation();
    
    const renderJobLogo = (logoKey) => {
        const logoMap = {
            '🏢': <Building size={24} className="text-blue-600 dark:text-blue-400" />,
            '🎨': <Palette size={24} className="text-pink-600 dark:text-pink-400" />,
            '📊': <BarChart2 size={24} className="text-green-600 dark:text-green-400" />,
            '💻': <Laptop size={24} className="text-purple-600 dark:text-purple-400" />,
            '📢': <Megaphone size={24} className="text-orange-600 dark:text-orange-400" />,
            '📦': <Package size={24} className="text-indigo-600 dark:text-indigo-400" />,
            '📈': <TrendingUp size={24} className="text-green-600 dark:text-green-400" />,
            '📋': <Clipboard size={24} className="text-amber-600 dark:text-amber-400" />,
            '💼': <Briefcase size={24} className="text-primary-600 dark:text-primary-400" />
        };
        return logoMap[logoKey] || <Briefcase size={24} className="text-primary-600 dark:text-primary-400" />;
    };

    const { profile } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState(profile?.location || 'Amman, Jordan');
    const [jobType, setJobType] = useState('all');
    const [experienceLevel, setExperienceLevel] = useState('all');
    const [salaryRange, setSalaryRange] = useState('all');
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchJobs = async (forceRefresh = false) => {
        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError('');

        try {
            const res = await api.get(`/jobs${forceRefresh ? '?refresh=true' : ''}`);
            if (res.data && res.data.data) {
                const fetchedJobs = res.data.data;
                setJobs(fetchedJobs);
                // Auto-select the first job for a premium look
                if (fetchedJobs.length > 0) {
                    setSelectedJob(fetchedJobs[0]);
                } else {
                    setSelectedJob(null);
                }
            }
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            setError(t('Failed to load localized jobs. Please try refreshing.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    const experienceLevels = ['all', 'Entry Level', 'Mid-Level', 'Senior', 'Lead'];
    const salaryRanges = ['all', 'Under 500 JOD', '500 JOD - 1000 JOD', '1000 JOD - 1500 JOD', '1500 JOD - 2000 JOD', '2000 JOD+'];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.requirements && job.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase())));
        
        const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
        const matchesType = jobType === 'all' || job.type === jobType;
        const matchesExperience = experienceLevel === 'all' || job.experience === experienceLevel;

        // Localized Salary filter logic
        let matchesSalary = true;
        if (salaryRange !== 'all') {
            const salaryNum = parseInt(job.salary.split('-')[0].replace(/[^0-9]/g, ''), 10);
            if (salaryRange === 'Under 500 JOD') matchesSalary = salaryNum < 500;
            else if (salaryRange === '500 JOD - 1000 JOD') matchesSalary = salaryNum >= 500 && salaryNum <= 1000;
            else if (salaryRange === '1000 JOD - 1500 JOD') matchesSalary = salaryNum >= 1000 && salaryNum <= 1500;
            else if (salaryRange === '1500 JOD - 2000 JOD') matchesSalary = salaryNum >= 1500 && salaryNum <= 2000;
            else if (salaryRange === '2000 JOD+') matchesSalary = salaryNum >= 2000;
        }

        return matchesSearch && matchesLocation && matchesType && matchesExperience && matchesSalary;
    });

    const toggleSaveJob = (jobId) => {
        if (savedJobs.includes(jobId)) {
            setSavedJobs(savedJobs.filter(id => id !== jobId));
        } else {
            setSavedJobs([...savedJobs, jobId]);
        }
    };

    const getJobSearchUrl = (title, location) => {
        const encodedTitle = encodeURIComponent(title);
        const encodedLocation = encodeURIComponent(location);
        return `https://www.google.com/search?q=${encodedTitle}+jobs+${encodedLocation}`;
    };

    const getLinkedInSearchUrl = (title, location) => {
        const encodedTitle = encodeURIComponent(title);
        const encodedLocation = encodeURIComponent(location);
        return `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLocation}`;
    };

    const getIndeedSearchUrl = (title, location) => {
        const encodedTitle = encodeURIComponent(title);
        const encodedLocation = encodeURIComponent(location);
        return `https://www.indeed.com/jobs?q=${encodedTitle}&l=${encodedLocation}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Job Search')}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Job Search')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('Find localized career opportunities in Jordan matching your AI goals')}</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <form onSubmit={(e) => e.preventDefault()} className="grid md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Job title, skills, or company')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Location')}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="tooltip-container flex-1">
                                <button 
                                    type="submit" 
                                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:scale-[1.01] transition-all flex items-center justify-center gap-2 font-semibold shadow-sm"
                                    aria-label="Search jobs"
                                >
                                    <Search size={18} />
                                    {t('Search')}
                                </button>
                                <span className="tooltip-text">{t('Search Jobs')}</span>
                            </div>
                            <div className="tooltip-container">
                                <button
                                    type="button"
                                    onClick={() => fetchJobs(true)}
                                    disabled={loading || refreshing}
                                    className="p-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                                    aria-label="Refresh job listings"
                                >
                                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                </button>
                                <span className="tooltip-text">{t('Refresh Listings')}</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 overflow-x-auto">
                    <div className="flex gap-4">
                        <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        >
                            {jobTypes.map(type => (
                                <option key={type} value={type}>{type === 'all' ? t('All Types') : t(type)}</option>
                            ))}
                        </select>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        >
                            {experienceLevels.map(level => (
                                <option key={level} value={level}>{level === 'all' ? t('All Levels') : t(level)}</option>
                            ))}
                        </select>
                        <select
                            value={salaryRange}
                            onChange={(e) => setSalaryRange(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        >
                            {salaryRanges.map(range => (
                                <option key={range} value={range}>{range === 'all' ? t('All Salaries') : t(range)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Job Listings Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Job List */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                        <div className="flex gap-4">
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No jobs found')}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{t('Try adjusting your search or refresh listings')}</p>
                            </div>
                        ) : (
                            filteredJobs.map(job => (
                                <div
                                    key={job.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${selectedJob?.id === job.id ? 'border-primary-500 shadow-md' : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                                            {renderJobLogo(job.logo)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between flex-wrap gap-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                                                </div>
                                                {job.matchScore && (
                                                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                                                        {job.matchScore}% Match
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Briefcase size={14} />
                                                    {t(job.type)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={14} />
                                                    {job.salary}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {t(job.posted)}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                                                {job.description}
                                            </p>

                                            <div className="flex gap-2 mt-4">
                                                <div className="tooltip-container">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSaveJob(job.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${savedJobs.includes(job.id)
                                                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400'
                                                            }`}
                                                    >
                                                        <Bookmark size={16} className={savedJobs.includes(job.id) ? 'fill-current' : ''} />
                                                    </button>
                                                    <span className="tooltip-text">{savedJobs.includes(job.id) ? t('Saved') : t('Save Job')}</span>
                                                </div>
                                                <div className="tooltip-container">
                                                    <a
                                                        href={getJobSearchUrl(job.title, job.location)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                    <span className="tooltip-text">{t('Apply Now')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Job Details Sidebar */}
                    <div className="lg:col-span-1">
                        {selectedJob ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                                            {renderJobLogo(selectedJob.logo)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{selectedJob.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJob.company}</p>
                                        </div>
                                    </div>
                                    <div className="tooltip-container">
                                        <button
                                            onClick={() => setSelectedJob(null)}
                                            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                        <span className="tooltip-text">{t('Close Details')}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{selectedJob.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase size={16} className="text-gray-400" />
                                        <span>{t(selectedJob.type)} · {t(selectedJob.experience)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign size={16} className="text-gray-400" />
                                        <span>{selectedJob.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>{t('Posted')} {t(selectedJob.posted)}</span>
                                    </div>
                                </div>

                                <div className="py-4">
                                    <h4 className="font-semibold mb-2">{t('Description')}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJob.description}</p>
                                </div>

                                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold mb-2">{t('Requirements')}</h4>
                                    <ul className="space-y-1">
                                        {selectedJob.requirements?.map((req, i) => (
                                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                <span className="text-primary-500">•</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold mb-2">{t('Benefits')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.benefits?.map((benefit, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                                                {t(benefit)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 space-y-2 flex flex-col items-center">
                                    <div className="tooltip-container w-full">
                                        <a
                                            href={getJobSearchUrl(selectedJob.title, selectedJob.location)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-[1.02] transition-transform"
                                        >
                                            <ExternalLink size={20} />
                                        </a>
                                        <span className="tooltip-text">{t('Apply Now')}</span>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <div className="tooltip-container flex-1">
                                            <a
                                                href={getLinkedInSearchUrl(selectedJob.title, selectedJob.location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                            >
                                                <Linkedin size={18} />
                                            </a>
                                            <span className="tooltip-text">{t('Search on LinkedIn')}</span>
                                        </div>
                                        <div className="tooltip-container flex-1">
                                            <a
                                                href={getIndeedSearchUrl(selectedJob.title, selectedJob.location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                            >
                                                <Globe size={18} />
                                            </a>
                                            <span className="tooltip-text">{t('Search on Indeed')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center sticky top-24">
                                <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('Select a job')}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Click on any job listing to see full details and apply')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobSearch;