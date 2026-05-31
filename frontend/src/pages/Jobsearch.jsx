import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Briefcase, MapPin, DollarSign, Building,
    ExternalLink, ChevronRight, Filter, Star, Clock,
    TrendingUp, Bookmark, Share2, Calendar, Award,
    Linkedin, Globe, Mail, Phone, Palette, BarChart2,
    Laptop, Megaphone, Package, Clipboard, X
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
    const { profile, recommendations } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState(profile?.location || '');
    const [jobType, setJobType] = useState('all');
    const [experienceLevel, setExperienceLevel] = useState('all');
    const [salaryRange, setSalaryRange] = useState('all');
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);

    const recs = recommendations ? (() => {
        try { return JSON.parse(recommendations); }
        catch { return []; }
    })() : [];

    // Sample job listings (in production, these would come from an API)
    const [jobs, setJobs] = useState([
        {
            id: 1,
            title: 'Senior Product Manager',
            company: 'TechCorp Solutions',
            location: 'San Francisco, CA',
            type: 'Full-time',
            experience: 'Senior',
            salary: '$140k - $180k',
            posted: '2 days ago',
            description: 'Lead product development for AI-powered solutions...',
            requirements: ['5+ years product management', 'Experience with AI/ML products', 'Strong leadership skills'],
            benefits: ['Remote work', 'Health insurance', 'Stock options'],
            logo: '🏢',
            matchScore: 94
        },
        {
            id: 2,
            title: 'UX/UI Designer',
            company: 'CreativeStudio',
            location: 'New York, NY',
            type: 'Full-time',
            experience: 'Mid-Level',
            salary: '$85k - $120k',
            posted: '1 week ago',
            description: 'Design beautiful and intuitive user experiences...',
            requirements: ['3+ years UX design', 'Figma expertise', 'User research experience'],
            benefits: ['Flexible hours', 'Design conferences', '401k match'],
            logo: '🎨',
            matchScore: 89
        },
        {
            id: 3,
            title: 'Data Scientist',
            company: 'DataFlow Analytics',
            location: 'Remote',
            type: 'Remote',
            experience: 'Mid-Level',
            salary: '$110k - $150k',
            posted: '3 days ago',
            description: 'Build machine learning models and data pipelines...',
            requirements: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
            benefits: ['Fully remote', 'Learning budget', 'Flexible schedule'],
            logo: '📊',
            matchScore: 87
        },
        {
            id: 4,
            title: 'Software Engineer',
            company: 'InnovateTech',
            location: 'Austin, TX',
            type: 'Full-time',
            experience: 'Entry Level',
            salary: '$75k - $95k',
            posted: '5 days ago',
            description: 'Develop and maintain web applications...',
            requirements: ['React', 'Node.js', 'TypeScript', 'REST APIs'],
            benefits: ['Mentorship program', 'Gym membership', 'Stock options'],
            logo: '💻',
            matchScore: 85
        },
        {
            id: 5,
            title: 'Marketing Manager',
            company: 'BrandBoost',
            location: 'Chicago, IL',
            type: 'Full-time',
            experience: 'Senior',
            salary: '$90k - $130k',
            posted: '1 day ago',
            description: 'Lead marketing strategy and campaigns...',
            requirements: ['5+ years marketing', 'Digital marketing expertise', 'Team leadership'],
            benefits: ['Performance bonus', 'Remote options', 'Career growth'],
            logo: '📢',
            matchScore: 82
        }
    ]);

    // Add AI-generated jobs from recommendations
    useEffect(() => {
        if (recs.length > 0) {
            const aiJobs = recs.map((rec, index) => ({
                id: `ai-${index}`,
                title: rec.title,
                company: rec.localCompanies?.[0]?.name || `${rec.title} Specialist`,
                location: rec.localCompanies?.[0]?.location || profile?.location || 'Various Locations',
                type: 'Full-time',
                experience: 'Mid-Level',
                salary: getSalaryForTitle(rec.title),
                posted: 'Recently',
                description: rec.reason || `Opportunity in ${rec.title} field`,
                requirements: rec.skills || [],
                benefits: ['Career growth', 'Competitive salary', 'Professional development'],
                logo: getLogoForTitle(rec.title),
                matchScore: 85 + Math.floor(Math.random() * 15),
                isAIGenerated: true
            }));
            setJobs([...aiJobs, ...jobs]);
        }
    }, [recs]);

    const getSalaryForTitle = (title) => {
        const salaries = {
            'Product Manager': '$95k - $145k',
            'UX Designer': '$75k - $120k',
            'Data Analyst': '$65k - $105k',
            'Software Engineer': '$85k - $150k',
            'Marketing Manager': '$70k - $110k',
            'Project Manager': '$80k - $130k'
        };
        return salaries[title] || '$70k - $100k';
    };

    const getLogoForTitle = (title) => {
        const logos = {
            'Product Manager': '📦',
            'UX Designer': '🎨',
            'Data Analyst': '📈',
            'Software Engineer': '💻',
            'Marketing Manager': '📢',
            'Project Manager': '📋'
        };
        return logos[title] || '💼';
    };

    const jobTypes = ['all', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
    const experienceLevels = ['all', 'Entry Level', 'Mid-Level', 'Senior', 'Lead'];
    const salaryRanges = ['all', 'Under $50k', '$50k - $80k', '$80k - $120k', '$120k - $150k', '$150k+'];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
        const matchesType = jobType === 'all' || job.type === jobType;
        const matchesExperience = experienceLevel === 'all' || job.experience === experienceLevel;

        // Salary filter logic
        let matchesSalary = true;
        if (salaryRange !== 'all') {
            const salaryNum = parseInt(job.salary.split('-')[0].replace(/[^0-9]/g, ''));
            if (salaryRange === 'Under $50k') matchesSalary = salaryNum < 50;
            else if (salaryRange === '$50k - $80k') matchesSalary = salaryNum >= 50 && salaryNum <= 80;
            else if (salaryRange === '$80k - $120k') matchesSalary = salaryNum >= 80 && salaryNum <= 120;
            else if (salaryRange === '$120k - $150k') matchesSalary = salaryNum >= 120 && salaryNum <= 150;
            else if (salaryRange === '$150k+') matchesSalary = salaryNum >= 150;
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
                    <p className="text-gray-600 dark:text-gray-400">{t('Find your next career opportunity')}</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Job title or keyword')}
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
                        <div className="tooltip-container">
                            <button className="p-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:scale-105 transition-transform flex items-center justify-center" aria-label="Search jobs">
                                <Search size={20} />
                            </button>
                            <span className="tooltip-text">{t('Search Jobs')}</span>
                        </div>
                    </div>
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
                                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
                            ))}
                        </select>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        >
                            {experienceLevels.map(level => (
                                <option key={level} value={level}>{level === 'all' ? 'All Levels' : level}</option>
                            ))}
                        </select>
                        <select
                            value={salaryRange}
                            onChange={(e) => setSalaryRange(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        >
                            {salaryRanges.map(range => (
                                <option key={range} value={range}>{range === 'all' ? 'All Salaries' : range}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Job List */}
                    <div className="lg:col-span-2 space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No jobs found')}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{t('Try adjusting your search criteria')}</p>
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
                                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
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
                                                    {job.type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={14} />
                                                    {job.salary}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {job.posted}
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
                                                        className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center justify-center animate-fade-in"
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
                                        <span>{selectedJob.type} · {selectedJob.experience}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign size={16} className="text-gray-400" />
                                        <span>{selectedJob.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>{t('Posted')} {selectedJob.posted}</span>
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
                                                {benefit}
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
                                            className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform"
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