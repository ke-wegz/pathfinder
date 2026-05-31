import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Activity, Target, Trophy, Flame, Award, TrendingUp,
    Calendar, CheckCircle, Clock, BarChart3, PieChart as PieChartIcon,
    ChevronRight, User, Briefcase, BookOpen, Code, Users
} from 'lucide-react';
import { normalizeGoal } from '../utils/goalUtils';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

const Progress = () => {
    const { t, i18n } = useTranslation();
    const { profile, goals, recommendations } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const [streak, setStreak] = useState(0);
    const recs = useMemo(() => {
        if (!recommendations) return [];
        try {
            return JSON.parse(recommendations);
        } catch {
            return [];
        }
    }, [recommendations]);

    const normalizedGoals = useMemo(() => {
        if (!Array.isArray(goals)) return [];
        return goals.map(normalizeGoal);
    }, [goals]);

    // Calculate streak
    useEffect(() => {
        if (normalizedGoals.length === 0) {
            setStreak(0);
            return;
        }

        const sortedDates = normalizedGoals
            .filter(g => g.createdAt)
            .map(g => new Date(g.createdAt).toDateString())
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        let checkDate = new Date();
        for (const dateStr of sortedDates) {
            if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
        }
        setStreak(currentStreak);
    }, [normalizedGoals]);

    const badges = useMemo(() => {
        const newBadges = [];
        const completedCount = normalizedGoals.filter(g => g.completed).length;

        if (completedCount >= 1) newBadges.push({ nameKey: 'First Goal', icon: Target, color: 'primary', earned: true });
        if (completedCount >= 5) newBadges.push({ nameKey: 'Goal Getter', icon: Trophy, color: 'secondary', earned: true });
        if (completedCount >= 10) newBadges.push({ nameKey: 'Goal Master', icon: Award, color: 'amber', earned: true });
        if (streak >= 3) newBadges.push({ nameKey: 'Consistency', icon: Flame, color: 'orange', earned: true });
        if (streak >= 7) newBadges.push({ nameKey: 'Unstoppable', icon: TrendingUp, color: 'red', earned: true });
        if (recs.length > 0) newBadges.push({ nameKey: 'Career Explorer', icon: Briefcase, color: 'green', earned: true });
        if (profile?.skills) newBadges.push({ nameKey: 'Profile Pro', icon: User, color: 'purple', earned: true });

        return newBadges;
    }, [normalizedGoals, streak, recs, profile]);

    // Prepare chart data
    useEffect(() => {
        const locale = i18n.language === 'ar' ? 'ar' : 'en';
        const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

        const weekly = weekOrder.map((dow) => {
            const dayGoals = normalizedGoals.filter((g) => {
                if (!g.createdAt) return false;
                return new Date(g.createdAt).getDay() === dow;
            }).length;
            const day = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                new Date(1970, 0, 4 + dow)
            );
            return { day, goals: dayGoals };
        });
        setWeeklyActivity(weekly);

        // Category progress data
        const categories = ['Career', 'Academic', 'Skill', 'Personal'];
        const catData = categories.map(cat => {
            const catGoals = normalizedGoals.filter(g => g.category === cat);
            const completed = catGoals.filter(g => g.completed).length;
            return {
                name: cat,
                total: catGoals.length,
                completed,
                percentage: catGoals.length ? Math.round((completed / catGoals.length) * 100) : 0
            };
        }).filter(c => c.total > 0);
        setCategoryData(catData);

        // Monthly progress data (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleDateString(locale, { month: 'short' });
            const monthGoals = normalizedGoals.filter(g => {
                if (!g.createdAt) return false;
                const goalDate = new Date(g.createdAt);
                return goalDate.getMonth() === date.getMonth() && goalDate.getFullYear() === date.getFullYear();
            });
            const completed = monthGoals.filter(g => g.completed).length;
            months.push({
                month: monthName,
                added: monthGoals.length,
                completed
            });
        }
        setChartData(months);
    }, [normalizedGoals, i18n.language]);

    const completedGoals = normalizedGoals.filter(g => g.completed);
    const activeGoals = normalizedGoals.filter(g => !g.completed);
    const completionRate = normalizedGoals.length ? Math.round((completedGoals.length / normalizedGoals.length) * 100) : 0;

    // Profile completion score
    const profileFields = ['name', 'education', 'skills', 'interests', 'goals', 'location'];
    const profileScore = profileFields.filter(field => profile?.[field]?.toString().length > 0).length;
    const profilePct = Math.round((profileScore / profileFields.length) * 100);

    // Career readiness score
    const careerReadiness = [
        { nameKey: 'Profile Complete', done: profilePct >= 60, icon: User },
        { nameKey: 'AI Interview Done', done: recs.length > 0, icon: Briefcase },
        { nameKey: 'Goals Set', done: normalizedGoals.length > 0, icon: Target },
        { nameKey: 'First Goal Completed', done: completedGoals.length > 0, icon: CheckCircle }
    ];

    const readinessScore = Math.round((careerReadiness.filter(r => r.done).length / careerReadiness.length) * 100);

    const pieData = useMemo(() => [
        { name: t('Completed'), value: completedGoals.length, color: '#22c55e' },
        { name: t('Active'), value: activeGoals.length, color: '#3b82f6' }
    ].filter(d => d.value > 0), [completedGoals.length, activeGoals.length, t]);

    const COLORS = ['#3b82f6', '#c026d3', '#22c55e', '#f59e0b', '#ef4444'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Progress')}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Progress Dashboard')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('Visual overview of your career journey')}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy size={20} className="text-yellow-500" />
                            <span className="text-xs text-gray-500">{completionRate}%</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals.length}/{normalizedGoals.length}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Goals Completed')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Target size={20} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeGoals.length}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Active Goals')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Flame size={20} className="text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{streak}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Day Streak')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Award size={20} className="text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{badges.length}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Badges Earned')}</div>
                    </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Progress Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary-600" />
                            {t('Monthly Progress')}
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="added" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name={t('Goals Added')} />
                                <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name={t('Goals Completed')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Goal Status Pie Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <PieChartIcon size={18} className="text-secondary-600" />
                            {t('Goal Status')}
                        </h3>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-400">
                                {t('No goals yet')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-primary-600" />
                        {t('Weekly Activity')}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Bar dataKey="goals" fill="#3b82f6" radius={[8, 8, 0, 0]} name={t('Goals Added')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Progress */}
                {categoryData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-5">{t('Progress by Category')}</h3>
                        <div className="space-y-4">
                            {categoryData.map((cat, i) => {
                                const colors = ['bg-primary-500', 'bg-secondary-500', 'bg-blue-500', 'bg-purple-500'];
                                return (
                                    <div key={cat.name}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{t(cat.name)}</span>
                                            <span className="text-gray-500">{cat.completed}/{cat.total} · {cat.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className={`${colors[i % colors.length]} h-2.5 rounded-full transition-all duration-700`}
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Badges */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={18} className="text-yellow-500" />
                        {t('Achievements & Badges')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {badges.map((badge, i) => {
                            const Icon = badge.icon;
                            const colors = {
                                primary: 'bg-primary-100 text-primary-600',
                                secondary: 'bg-secondary-100 text-secondary-600',
                                amber: 'bg-amber-100 text-amber-600',
                                orange: 'bg-orange-100 text-orange-600',
                                red: 'bg-red-100 text-red-600',
                                green: 'bg-green-100 text-green-600',
                                purple: 'bg-purple-100 text-purple-600'
                            };
                            return (
                                <div key={i} className={`p-4 rounded-xl ${colors[badge.color]} text-center`}>
                                    <Icon size={32} className="mx-auto mb-2" />
                                    <p className="font-semibold text-sm">{t(badge.nameKey)}</p>
                                </div>
                            );
                        })}
                        {badges.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-400">
                                <Award size={48} className="mx-auto mb-2 opacity-40" />
                                <p>{t('Complete goals to earn badges!')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Career Readiness */}
                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp size={20} />
                        {t('Career Readiness Score')}
                    </h3>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-5xl font-bold">{readinessScore}%</div>
                        <div className="flex-1 min-w-[200px]">
                            <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                                <div
                                    className="bg-white h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${readinessScore}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {careerReadiness.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-1.5">
                                            {item.done ? (
                                                <CheckCircle size={14} className="text-green-300" />
                                            ) : (
                                                <div className="w-3.5 h-3.5 rounded-full border border-white/40" />
                                            )}
                                            <span className={item.done ? 'text-white' : 'text-blue-200'}>{t(item.nameKey)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
