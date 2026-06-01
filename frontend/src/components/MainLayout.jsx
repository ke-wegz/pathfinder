// src/components/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Compass, MessageCircle, BookOpen, Users, Settings,
    LogOut, ChevronDown, Sun, Moon, Menu, X, Bell,
    User, Target, BarChart2, Search, FileDown, Briefcase,
    Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MainLayout = ({ children, profile: propProfile, user: propUser, unreadCount: propUnreadCount }) => {
    const { t } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch auth state values from useAuth hook
    const { logout, user: authUser, profile: authProfile, unreadCount: authUnreadCount } = useAuth();
    const user = propUser !== undefined ? propUser : authUser;
    const profile = propProfile !== undefined ? propProfile : authProfile;
    const unreadCount = propUnreadCount !== undefined ? propUnreadCount : authUnreadCount;

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: t('Dashboard'), href: '/dashboard', icon: Compass },
        { name: t('Interview'), href: '/interview', icon: MessageCircle },
        { name: t('Career Paths'), href: '/paths', icon: Briefcase },
        { name: t('Resource Hub'), href: '/resources', icon: BookOpen },
        { name: t('Community'), href: '/community', icon: Users },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo - Clickable to home */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                            onClick={() => {
                                // Close mobile menu if open
                                if (mobileMenuOpen) setMobileMenuOpen(false);
                            }}
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <Compass size={20} className="text-white" />
                            </div>
                            PathFinder AI
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.href)
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Notification Bell - Only show if logged in */}
                            {user && (
                                <div className="tooltip-container">
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
                                    <span className="tooltip-text">{t('Notifications')}</span>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <div className="tooltip-container">
                                <button
                                    onClick={toggleDarkMode}
                                    className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                                    aria-label="Toggle theme"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                                <span className="tooltip-text">{darkMode ? t('Switch to Light Mode') : t('Switch to Dark Mode')}</span>
                            </div>

                            {user ? (
                                /* User Menu - Logged In */
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium hidden sm:inline">
                                            {profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                                        </span>
                                        <ChevronDown size={16} className="hidden sm:block" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <User size={16} />
                                                    {t('Profile')}
                                                </Link>
                                                <Link
                                                    to="/cv"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <FileDown size={16} />
                                                    {t('CV Builder')}
                                                </Link>
                                                <Link
                                                    to="/goals"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Target size={16} />
                                                    {t('Goals')}
                                                </Link>
                                                <Link
                                                    to="/progress"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <BarChart2 size={16} />
                                                    {t('Progress')}
                                                </Link>
                                                <Link
                                                    to="/jobs"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Search size={16} />
                                                    {t('Job Search')}
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <Settings size={16} />
                                                    {t('Settings')}
                                                </Link>
                                                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <LogOut size={16} />
                                                    {t('Logout')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* Login/Signup Buttons - Not Logged In */
                                <>
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
                                    >
                                        {t('Log in')}
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105"
                                    >
                                        {t('Get Started')}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="tooltip-container md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <span className="tooltip-text">{mobileMenuOpen ? t('Close Menu') : t('Open Menu')}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-xl transform transition-transform duration-300 ease-out overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-xl font-bold"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                    <Compass size={20} className="text-white" />
                                </div>
                                PathFinder AI
                            </Link>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile Menu User Actions */}
                        {user ? (
                            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-semibold text-gray-900 dark:text-white truncate">{profile?.name || t('User')}</div>
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
                                        <span className="text-sm font-medium">{t('Notifications')}</span>
                                    </Link>
                                    <button onClick={toggleDarkMode} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                        <span className="text-sm font-medium">{t('Theme')}</span>
                                    </button>
                                </div>
                                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-2">
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
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(link.href)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {link.name}
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                            {user ? (
                                <>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <User size={20} />
                                        {t('Profile')}
                                    </Link>
                                    <Link to="/cv" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <FileDown size={20} />
                                        {t('CV Builder')}
                                    </Link>
                                    <Link to="/goals" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <Target size={20} />
                                        {t('Goals')}
                                    </Link>
                                    <Link to="/progress" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <BarChart2 size={20} />
                                        {t('Progress')}
                                    </Link>
                                    <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <Search size={20} />
                                        {t('Job Search')}
                                    </Link>
                                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        <Settings size={20} />
                                        {t('Settings')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                        {t('Log in')}
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl">
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

            {/* Main Content */}
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
