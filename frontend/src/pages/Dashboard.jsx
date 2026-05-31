import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Target, BookOpen, TrendingUp, Award, Plus, Briefcase, Code,
  Users, Check, Bookmark, MessageSquare, Star, Zap, Compass,
  MessageCircle, CheckCircle, Clock, ChevronRight, Smile
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile, goals: contextGoals } = useAuth();
  const userName = profile?.name || user?.name || user?.email?.split('@')[0] || t('User');

  // Use goals from context, map them to have required properties for UI
  const goals = (contextGoals || []).slice(0, 5).map(g => ({
    id: g._id,
    title: g.text,
    target: g.deadline ? new Date(g.deadline).toLocaleDateString() : t('No deadline'),
    progress: g.progress || (g.completed ? 100 : 0),
    completed: g.completed ? 1 : 0,
    total: 1,
    daysLeft: g.deadline ? Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
    icon: g.category === 'Career' ? Briefcase : g.category === 'Skill' ? Code : Target,
    color: g.priority === 'high' ? 'amber' : g.priority === 'medium' ? 'primary' : 'secondary'
  }));

  // Derive some basic achievements from goals/profile for now
  const achievements = [];
  if (profile?.skills?.length > 0) {
    achievements.push({ id: 1, title: t('Skill Builder'), description: t('Added {{count}} skills', { count: profile.skills.length }), icon: Star, color: 'amber' });
  }
  if (contextGoals?.length > 0) {
    achievements.push({ id: 2, title: t('Goal Setter'), description: t('Created your first goal'), icon: Target, color: 'blue' });
  }
  if (contextGoals?.some(g => g.completed)) {
    achievements.push({ id: 3, title: t('Achiever'), description: t('Completed a goal'), icon: Award, color: 'green' });
  }

  // Derive stats
  const completedGoalsCount = contextGoals?.filter(g => g.completed).length || 0;
  const totalGoalsCount = contextGoals?.length || 0;
  const overallProgress = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  const stats = [
    { label: t('Goals Completed'), value: `${completedGoalsCount}/${totalGoalsCount}`, change: t('Real-time'), changeColor: 'green', icon: Target, color: 'primary' },
    { label: t('Overall Progress'), value: `${overallProgress}%`, change: t('On track'), changeColor: 'green', icon: TrendingUp, color: 'primary' },
    { label: t('Achievements'), value: achievements.length.toString(), change: t('Derived'), changeColor: 'amber', icon: Award, color: 'secondary' }
  ];

  const quickActions = [
    { to: '/interview', label: t('Take AI Interview', 'Take AI Interview'), icon: MessageCircle, color: 'primary' },
    { to: '/paths', label: t('View Recommendations', 'View Recommendations'), icon: Compass, color: 'secondary' },
    { to: '/resources', label: t('Browse Resources', 'Browse Resources'), icon: BookOpen, color: 'primary' },
    { to: '/community', label: t('Join Community', 'Join Community'), icon: Users, color: 'secondary' }
  ];

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      primary: {
        bg: 'bg-primary-100 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400',
        gradient: 'from-primary-600 to-secondary-600',
        hover: 'hover:bg-primary-50 dark:hover:bg-gray-700'
      },
      secondary: {
        bg: 'bg-secondary-100 dark:bg-secondary-900/30',
        text: 'text-secondary-600 dark:text-secondary-400',
        gradient: 'from-secondary-600 to-primary-600',
        hover: 'hover:bg-secondary-50 dark:hover:bg-gray-700'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400'
      }
    };
    return colors[color]?.[type] || colors.primary[type];
  };

  return (
    <div className="w-full min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            {t('Welcome back')}, {userName}! <Smile size={32} className="text-yellow-500 animate-bounce flex-shrink-0" style={{ animationDuration: '3s' }} />
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("Here's your career progress overview", "Here's your career progress overview")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const changeColor = stat.changeColor === 'green' ? 'text-green-600 dark:text-green-400' :
              stat.changeColor === 'primary' ? 'text-primary-600 dark:text-primary-400' : 'text-amber-600 dark:text-amber-400';
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${getColorClasses(stat.color, 'bg')} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${getColorClasses(stat.color, 'text')}`} />
                  </div>
                  <span className={`text-sm font-medium ${changeColor}`}>{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Goals */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Current Goals', 'Current Goals')}</h2>
                <Link
                  to="/goals"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t('Add Goal', 'Add Goal')}
                </Link>
              </div>

              <div className="space-y-4">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${getColorClasses(goal.color, 'bg')} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${getColorClasses(goal.color, 'text')}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('Target:')} {goal.target}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${getColorClasses(goal.color, 'text')}`}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${goal.color === 'primary' ? 'from-primary-600 to-secondary-600' : 'from-secondary-600 to-primary-600'}`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {goal.completed}/{goal.total} {goal.total === 20 ? 'modules' : goal.total === 10 ? 'connections' : 'tasks'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {goal.daysLeft} days left
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('Quick Actions', 'Quick Actions')}</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.to}
                      className={`flex items-center gap-3 p-3 rounded-xl ${getColorClasses(action.color, 'hover')} transition-colors group`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${getColorClasses(action.color, 'bg')} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${getColorClasses(action.color, 'text')}`} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('Recent Achievements')}</h2>
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const gradientColors = {
                    amber: 'from-amber-400 to-amber-600',
                    purple: 'from-purple-400 to-purple-600',
                    green: 'from-green-400 to-green-600',
                    blue: 'from-blue-400 to-blue-600'
                  };
                  return (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors[achievement.color]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{achievement.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-2">{t('Next Milestone')}</h2>
              <p className="text-primary-100 text-sm mb-4">{t('Complete 2 more modules to unlock your certification')}</p>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-white" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm font-medium">{t('75% complete')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;