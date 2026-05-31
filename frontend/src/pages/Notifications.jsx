import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Bell, CheckCircle, Calendar, MessageCircle, Heart,
    UserPlus, Award, TrendingUp, Clock, Settings,
    ChevronRight, Trash2, CheckCheck, BellOff,
    Mail, AlertCircle, Info, X, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { t } = useTranslation();
    const { user, profile, goals, setUnreadCount, setUnreadCountFromNotifications } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                const notifs = res.data.data.map(doc => ({
                    ...doc,
                    id: doc._id,
                    read: doc.isRead
                }));
                setNotifications(notifs);
                setUnreadCountFromNotifications(notifs);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [user, setUnreadCountFromNotifications]);

    useEffect(() => {
        if ('Notification' in window) {
            setPushEnabled(Notification.permission === 'granted');
        }
    }, []);

    const requestPushPermission = async () => {
        if (!('Notification' in window)) {
            alert('Your browser does not support notifications.');
            return;
        }

        setPushLoading(true);
        const permission = await Notification.requestPermission();
        setPushEnabled(permission === 'granted');
        setPushLoading(false);

        if (permission === 'granted') {
            // Add welcome notification
            await addNotification(t('Welcome to PathFinder AI!'), t('We will keep you updated on your career journey.'), 'system');
            new Notification('PathFinder AI', { body: t('Notifications enabled! We will keep you updated.') });
        }
    };

    const addNotification = async (title, body, type = 'info') => {
        try {
            const res = await api.post('/notifications', { title, body, type });
            const newNotif = { ...res.data.data, id: res.data.data._id, read: false, isRead: false };
            const updated = [newNotif, ...notifications];
            setNotifications(updated);
            setUnreadCountFromNotifications(updated);
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const markAsRead = async (notifId) => {
        try {
            await api.patch(`/notifications/${notifId}/read`);
            const updated = notifications.map(n => n.id === notifId ? { ...n, read: true, isRead: true } : n);
            setNotifications(updated);
            setUnreadCountFromNotifications(updated);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            const updated = notifications.map(n => ({ ...n, read: true, isRead: true }));
            setNotifications(updated);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notifId) => {
        try {
            await api.delete(`/notifications/${notifId}`);
            const updated = notifications.filter(n => n.id !== notifId);
            setNotifications(updated);
            setUnreadCountFromNotifications(updated);
            if (selectedNotification?.id === notifId) {
                setSelectedNotification(null);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const deleteAllNotifications = async () => {
        if (window.confirm(t('Delete all notifications? This action cannot be undone.'))) {
            try {
                await api.delete('/notifications');
                setNotifications([]);
                setUnreadCount(0);
                setSelectedNotification(null);
            } catch (error) {
                console.error('Error deleting all notifications:', error);
            }
        }
    };

    const sendGoalReminder = async () => {
        const activeGoals = goals.filter(g => !g.completed);
        const title = t('Goal Reminder');
        const body = activeGoals.length > 0
            ? t('You have active goals next', { count: activeGoals.length, text: activeGoals[0].text, defaultValue: `You have ${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''}. Next: "${activeGoals[0].text}"` })
            : t('You have no active goals. Head to the Goals tab to set some!');

        await addNotification(title, body, 'reminder');

        if (pushEnabled && 'Notification' in window) {
            new Notification('PathFinder AI', { body });
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const typeStyles = {
        reminder: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        system: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        info: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        alert: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        like: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
        comment: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    };

    const typeIcons = {
        reminder: Calendar,
        system: CheckCircle,
        info: Info,
        alert: AlertCircle,
        success: Award,
        like: Heart,
        comment: MessageCircle
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Notifications')}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Bell size={28} className="text-primary-600" />
                                {t('Notifications')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('unread notifications', { count: unreadCount, defaultValue: `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` })}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                            >
                                <CheckCheck size={16} />
                                {t('Mark all as read')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('Quick Actions')}</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={sendGoalReminder}
                            className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            {t('Send Goal Reminder')}
                        </button>
                        <button
                            onClick={requestPushPermission}
                            disabled={pushLoading}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${pushEnabled
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                                    : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                                }`}
                        >
                            <Bell size={16} />
                            {pushEnabled ? t('Push Notifications Enabled') : pushLoading ? t('Enabling...') : t('Enable Push Notifications')}
                        </button>
                        {notifications.length > 0 && (
                            <button
                                onClick={deleteAllNotifications}
                                className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                {t('Clear All')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                            }`}
                    >
                        {t('All')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'unread'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                            }`}
                    >
                        {t('Unread')}
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === 'read'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                            }`}
                    >
                        {t('Read')}
                    </button>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <BellOff size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No notifications')}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{t("You're all caught up! New notifications will appear here.")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map(notif => {
                            const Icon = typeIcons[notif.type] || Info;
                            const isUnread = !notif.read;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        if (isUnread) markAsRead(notif.id);
                                        setSelectedNotification(selectedNotification?.id === notif.id ? null : notif);
                                    }}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer hover:shadow-md ${typeStyles[notif.type] || typeStyles.info
                                        } ${isUnread ? 'border-l-4 border-l-primary-500' : 'opacity-80'}`}
                                >
                                    <div className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnread ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                <Icon size={18} className={isUnread ? 'text-primary-600' : 'text-gray-500'} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className={`font-semibold ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {notif.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                                            {notif.body}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Clock size={12} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">{formatTime(notif.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isUnread && (
                                                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                                        )}
                                                        {(notif.goalID || notif.postID) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isUnread) markAsRead(notif.id);
                                                                    if (notif.goalID) navigate('/goals');
                                                                    if (notif.postID) navigate('/community');
                                                                }}
                                                                className="text-primary-600 hover:text-primary-700 transition-colors p-1"
                                                                title={`View ${notif.goalID ? 'Goal' : 'Post'}`}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notif.id);
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Delete Notification"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content (if notification has more details) */}
                                    {selectedNotification?.id === notif.id && notif.details && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{notif.details}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;