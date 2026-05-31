import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Compass, User, MessageSquare, Map, BookOpen, Users, Settings,
    LogOut, Target, BarChart2, Search, FileDown, Bell, Menu, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Layout = ({ children, profile, user, unreadCount }) => {
    const { t } = useTranslation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { id: '/dashboard', label: t('Dashboard'), icon: <Compass size={20} /> },
        { id: '/profile', label: t('My Profile'), icon: <User size={20} /> },
        { id: '/cv', label: t('CV Builder'), icon: <FileDown size={20} /> },
        { id: '/goals', label: t('Goals'), icon: <Target size={20} /> },
        { id: '/progress', label: t('Progress'), icon: <BarChart2 size={20} /> },
        { id: '/jobs', label: t('Job Search'), icon: <Search size={20} /> },
        { id: '/interview', label: t('AI Interview'), icon: <MessageSquare size={20} /> },
        { id: '/paths', label: t('Career Paths'), icon: <Map size={20} /> },
        { id: '/resources', label: t('Resource Hub'), icon: <BookOpen size={20} /> },
        { id: '/community', label: t('Community'), icon: <Users size={20} /> },
        { id: '/notifications', label: t('Notifications'), icon: <Bell size={20} /> },
        { id: '/settings', label: t('Settings'), icon: <Settings size={20} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarClass = `fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <div className={sidebarClass}>
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Compass size={24} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">PathFinder AI</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-1 overflow-y-auto flex-1">
                    {navItems.map(item => (
                        <Link
                            key={item.id}
                            to={item.id}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${location.pathname === item.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                            {item.id === '/notifications' && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-700">
                    <button onClick={handleLogout}
                        className="flex items-center space-x-3 text-slate-400 text-sm hover:text-red-400 transition-colors w-full">
                        <LogOut size={16} />
                        <span>{t('Sign Out')}</span>
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            {/* Main Content Area - This is where scrolling happens */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 justify-between md:justify-end flex-shrink-0">
                    <button onClick={() => setIsMobileOpen(true)} className="md:hidden text-slate-500 dark:text-slate-400">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{profile?.name || user?.email}</p>
                            <p className="text-xs text-green-500">{t('Online')}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;