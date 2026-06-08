import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  Users, GraduationCap, BookOpen, MessageSquareCode,
  ArrowUpRight, Target, Activity, ShieldAlert, AlertCircle, Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setMetrics(res.data.data);
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
        setError(t('Failed to load dashboard metrics.'));
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [t]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
        <AlertCircle className="text-red-500" size={20} />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      title: t('Total Users'),
      value: metrics?.users?.total || 0,
      description: `${metrics?.users?.standard || 0} Standard, ${metrics?.users?.expert || 0} Experts`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      link: '/admin/users'
    },
    {
      title: t('Total Experts'),
      value: metrics?.users?.expert || 0,
      description: t('Verified counselors & mentors'),
      icon: GraduationCap,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      link: '/admin/experts'
    },
    {
      title: t('Learning Resources'),
      value: metrics?.resources?.total || metrics?.resources || 0,
      description: t('Courses, books, and articles'),
      icon: BookOpen,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      link: '/admin/resources'
    },
    {
      title: t('AI Interview Sessions'),
      value: metrics?.sessions?.total || 0,
      description: `${metrics?.sessions?.avgPerUser || 0} avg. sessions per user`,
      icon: MessageSquareCode,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      link: '/admin/analytics'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('Welcome, Administrator')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('Overview of the platform activity and administrative shortcuts.')}</p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon size={24} />
                </div>
                <Link to={card.link} className="text-gray-400 hover:text-primary-600 transition-colors">
                  <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary-600" />
            <span>{t('Overall Achievements')}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('Goal Completion Rate')}</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics?.goals?.rate || 0}%</h4>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Target size={20} />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('Active User Ratio')}</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metrics?.users?.total ? Math.round(((metrics.users.total - metrics.users.disabled) / metrics.users.total) * 100) : 100}%
                </h4>
              </div>
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                <Activity size={20} />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('Quick Administrative Actions')}</h4>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/experts?add=true" className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all">
                {t('Onboard New Expert')}
              </Link>
              <Link to="/admin/resources?add=true" className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-650 text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all">
                {t('Add Learning Resource')}
              </Link>
              <Link to="/admin/community" className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all">
                {t('Moderate Community')}
              </Link>
              <Link to="/admin/analytics" className="px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-550 dark:hover:bg-gray-750 text-xs font-bold rounded-lg transition-all">
                {t('Inspect API Analytics')}
              </Link>
            </div>
          </div>
        </div>

        {/* Security / System Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" />
              <span>{t('System Integrity')}</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('Firestore Security Rules')}</span>
                <span className="px-2.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">{t('Active')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('Active Admins')}</span>
                <span className="font-bold text-gray-800 dark:text-white">{metrics?.users?.admin || 1}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('Disabled Accounts')}</span>
                <span className={`font-bold ${metrics?.users?.disabled ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                  {metrics?.users?.disabled || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('PathFinder Admin system tracks and evaluates access control metrics continuously. Contact technical support if you see anomalous API request spikes.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
