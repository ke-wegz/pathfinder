import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Sparkles, MessageCircle, PlayCircle, UserPlus, Compass,
    TrendingUp, Cpu, DollarSign, BookOpen, Users, Target, Shield,
    Rocket, LogIn, Sun, Moon, Menu, X, ChevronDown, Twitter,
    Github, Linkedin, Mail, Bell, LogOut
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const faqs = [
    {
        question: "How does the PathFinder AI Interview work?",
        answer: "Our system conducts an interactive AI-powered interview to gather comprehensive information about your academic background, interests, and career goals. This helps us provide tailored guidance.",
    },
    {
        question: "What kind of recommendations will I receive?",
        answer: "Based on your profile, the AI generates personalized career recommendations and suggests tailored educational resources, including local learning centers.",
    },
    {
        question: "Is my personal data secure?",
        answer: "Absolutely. We provide strict privacy controls and all user data is encrypted in transit and at rest. We do not expose personal data without your consent and comply with privacy regulations like GDPR.",
    },
    {
        question: "Can I connect with other users or experts?",
        answer: "Yes! PathFinder AI includes community discussion forums where you can share insights with peers and participate in discussions with Career Experts.",
    },
    {
        question: "Does the AI improve over time?",
        answer: "Yes, our Refinement System collects user feedback on recommendations to refine AI accuracy on a monthly basis.",
    },
];

const FaqItem = ({ faq, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t(faq.question)}
                </span>
                <ChevronDown
                    className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    size={24}
                />
            </button>

            <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
            >
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(faq.answer)}
                </p>
            </div>
        </div>
    );
};

const Index = () => {
    const { t } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, profile, logout, unreadCount } = useAuth();
    const isLoggedIn = !!user;
    const userName = profile?.name || user?.email?.split('@')[0] || 'User';

    // Check for dark mode preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newDarkMode);
    };

    // Close mobile menu when clicking outside and handle body scroll lock
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-btn')) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        
        // Lock body scroll when mobile menu is open
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: t('Dashboard'), href: '/dashboard' },
        { name: t('AI Interview'), href: '/interview' },
        { name: t('Recommendations'), href: '/paths' },
        { name: t('Resources'), href: '/resources' },
        { name: t('Community'), href: '/community' },
    ];

    const stats = [
        { endValue: 50, suffix: 'K+', label: t('Careers Matched'), colorClass: 'text-primary-600' },
        { endValue: 94, suffix: '%', label: t('Satisfaction Rate'), colorClass: 'text-secondary-600' },
        { endValue: 200, suffix: '+', label: t('Industries Covered'), colorClass: 'text-primary-600' },
        { endValue: 15, suffix: 'min', label: t('Avg. Assessment Time'), colorClass: 'text-secondary-600' },
    ];

    const steps = [
        { step: 1, title: t('Create Profile'), desc: t('Set up your account and share your background, education, and interests.'), icon: UserPlus, color: 'primary' },
        { step: 2, title: t('AI Interview'), desc: t('Chat with our AI in a natural conversation about your goals and preferences.'), icon: MessageCircle, color: 'secondary' },
        { step: 3, title: t('Get Recommendations'), desc: t('Receive personalized career matches with detailed insights and salary data.'), icon: Compass, color: 'primary' },
        { step: 4, title: t('Track Progress'), desc: t('Follow your personalized roadmap with resources and community support.'), icon: TrendingUp, color: 'secondary' },
    ];

    const features = [
        { title: t('AI-Powered Matching'), desc: t('Advanced algorithms analyze your unique profile for perfect career fits.'), icon: Cpu, color: 'primary' },
        { title: t('Salary Insights'), desc: t('Real-time salary data and growth projections for every recommendation.'), icon: DollarSign, color: 'secondary' },
        { title: t('Learning Paths'), desc: t('Curated courses and certifications to build required skills.'), icon: BookOpen, color: 'primary' },
        { title: t('Community Forums'), desc: t('Connect with peers and mentors in your target industries.'), icon: Users, color: 'secondary' },
        { title: t('Goal Tracking'), desc: t('Set milestones and monitor your progress with visual dashboards.'), icon: Target, color: 'primary' },
        { title: t('Privacy First'), desc: t('Your data is encrypted and never shared without consent.'), icon: Shield, color: 'secondary' },
    ];

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Mail, href: '#', label: 'Email' },
    ];

    const footerLinks = {
        Product: [
            { name: t('Features'), href: '#how-it-works' },
            { name: t('Pricing'), href: '#' },
            { name: t('FAQ'), href: '#faq' },
            { name: t('Roadmap'), href: '#' }
        ],
        Resources: [
            { name: t('Blog'), href: '#' },
            { name: t('Help Center'), href: '#' },
            { name: t('Community'), href: '/community' },
            { name: t('Guides'), href: '#' }
        ],
        Company: [
            { name: t('About'), href: '/about' },
            { name: t('Careers'), href: '#' },
            { name: t('Contact'), href: '/contact' },
            { name: t('Press'), href: '#' }
        ],
        Legal: [
            { name: t('Privacy'), href: '/privacy' },
            { name: t('Terms'), href: '/terms' },
            { name: t('Security'), href: '/security' },
            { name: t('Cookies'), href: '/cookies' }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <Compass size={20} className="text-white" />
                            </div>
                            PathFinder
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {isLoggedIn && (
                                <Link
                                    to="/notifications"
                                    className="relative w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <button
                                onClick={toggleDarkMode}
                                className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {userName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium">{userName}</span>
                                        <ChevronDown size={16} />
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {t('Profile')}
                                            </Link>
                                            <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {t('Settings')}
                                            </Link>
                                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                {t('Sign out')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                        {t('Log in')}
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        {t('Get Started')}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(!mobileMenuOpen);
                            }}
                            className="menu-btn md:hidden w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-xl transform transition-transform duration-300 ease-out overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <Link to="/" className="flex items-center gap-2 text-xl font-bold" onClick={() => setMobileMenuOpen(false)}>
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                    <Compass size={20} className="text-white" />
                                </div>
                                PathFinder
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile Menu User Actions */}
                        {isLoggedIn ? (
                            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-semibold">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-semibold text-gray-900 dark:text-white truncate">{userName}</div>
                                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-2">
                                    <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        <div className="relative">
                                            <Bell size={18} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{t('Alerts')}</span>
                                    </Link>
                                    <button onClick={toggleDarkMode} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                        <span className="text-sm font-medium">{t('Theme')}</span>
                                    </button>
                                </div>
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-2">
                                    <LogOut size={18} />
                                    <span className="text-sm font-medium">{t('Sign out')}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="mb-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{t('Theme')}</span>
                                <button onClick={toggleDarkMode} className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                            {isLoggedIn ? (
                                <>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        {t('Profile')}
                                    </Link>
                                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        {t('Settings')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        {t('Log in')}
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                                        {t('Get Started')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Backdrop */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 dark:bg-primary-400/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400/20 dark:bg-secondary-400/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
                                <Sparkles size={16} />
                                <span>{t('AI-Powered Career Guidance')}</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                                {t('Find Your Perfect')}
                                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> {t('Career Path')}</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                                {t('PathFinder AI uses advanced artificial intelligence to analyze your skills, interests, and goals—then guides you toward a fulfilling career with personalized recommendations.')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/interview"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-primary-600/25"
                                >
                                    <MessageCircle size={20} />
                                    {t('Start AI Interview')}
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 font-semibold transition-all"
                                >
                                    <PlayCircle size={20} />
                                    {t('See How It Works')}
                                </a>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, idx) => {
                                const { ref, inView } = useInView({ triggerOnce: true });

                                return (
                                    <div
                                        key={idx}
                                        ref={ref}
                                        className="text-center group p-4 rounded-xl transition-all duration-300 hover:scale-105"
                                    >
                                        <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${stat.colorClass}`}>
                                            {inView ? (
                                                <CountUp
                                                    start={0}
                                                    end={stat.endValue}
                                                    duration={2.5}
                                                    separator=","
                                                    suffix={stat.suffix}
                                                />
                                            ) : (
                                                "0" + stat.suffix
                                            )}
                                        </div>
                                        <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                            {stat.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-20 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('How PathFinder AI Works')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('Four simple steps to discover your ideal career path and get actionable guidance.')}</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <div key={idx} className="relative group cursor-pointer">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                                        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 h-full transition-transform duration-300 ease-out group-hover:-translate-y-2">
                                            <div className={`w-12 h-12 rounded-xl bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center mb-4 transition-all duration-500 ease-in-out group-hover:rotate-12 group-hover:scale-110`}>
                                                <Icon className={`w-6 h-6 text-${step.color}-600`} />
                                            </div>
                                            <div className={`text-sm font-semibold text-${step.color}-600 mb-2`}>{t('Step')} {step.step}</div>
                                            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('Everything You Need to Succeed')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('Comprehensive tools and resources to guide your career journey.')}</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, idx) => {
                                const { ref, inView } = useInView({
                                    triggerOnce: true,
                                    threshold: 0.1,
                                });
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={idx}
                                        ref={ref}
                                        className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 ${
                                            inView
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-12"
                                        }`}
                                        style={{ transitionDelay: `${idx * 150}ms` }}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                                            <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                                        </div>
                                        <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('Ready to Find Your Path?')}</h2>
                        <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">{t('Join thousands of professionals who discovered their ideal careers with PathFinder AI.')}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-gray-100 transition-all"
                            >
                                <Rocket size={20} />
                                {t('Get Started Free')}
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-700/50 text-white border border-primary-400/30 hover:bg-primary-700/70 font-semibold transition-all"
                            >
                                <LogIn size={20} />
                                {t('Sign In')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-900/50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('Frequently Asked Questions')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('Everything you need to know about PathFinder AI and how it works.')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <FaqItem key={index} faq={faq} index={index} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                    <Compass size={18} className="text-white" />
                                </div>
                                <span className="text-xl font-bold">PathFinder AI</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                                {t('AI-powered career guidance to help you find your perfect path.')}
                            </p>
                            <div className="flex gap-2">
                                {socialLinks.map((social, idx) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={idx}
                                            href={social.href}
                                            className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            aria-label={social.label}
                                        >
                                            <Icon size={18} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h4 className="font-semibold mb-3">{t(category)}</h4>
                                <ul className="space-y-2">
                                    {links.map((link, idx) => (
                                        <li key={idx}>
                                            {link.href.startsWith('/') ? (
                                                <Link
                                                    to={link.href}
                                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    {link.name}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                >
                                                    {link.name}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('© 2024 PathFinder AI. All rights reserved.')}
                        </p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">{t('Privacy Policy')}</Link>
                            <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">{t('Terms of Service')}</Link>
                            <Link to="/cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">{t('Cookie Policy')}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Index;