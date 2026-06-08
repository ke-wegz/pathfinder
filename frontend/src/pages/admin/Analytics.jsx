import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, Activity, PieChart as PieIcon, LineChart as LineIcon,
  AlertCircle, Loader2
} from 'lucide-react';

const Analytics = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(t('Failed to load analytics data.'));
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
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

  // 1. Prepare User Role Data
  const roleData = [
    { name: t('Standard Users'), value: data?.users?.standard || 0, color: '#3B82F6' },
    { name: t('Career Experts'), value: data?.users?.expert || 0, color: '#10B981' },
    { name: t('Administrators'), value: data?.users?.admin || 0, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // 2. Prepare Goal Data
  const goalData = [
    { name: t('Completed Goals'), value: data?.goals?.completed || 0, color: '#8B5CF6' },
    { name: t('Active Goals'), value: data?.goals?.active || 0, color: '#EC4899' }
  ];

  // 3. Prepare API Usage Data (fill with mocks if empty)
  const apiDailyData = (data?.apiUsage?.daily && data.apiUsage.daily.length > 0)
    ? data.apiUsage.daily 
    : [
        { date: 'Mon', requests: 45 },
        { date: 'Tue', requests: 78 },
        { date: 'Wed', requests: 124 },
        { date: 'Thu', requests: 89 },
        { date: 'Fri', requests: 145 },
        { date: 'Sat', requests: 210 },
        { date: 'Sun', requests: 180 }
      ];

  // 4. Prepare Top Routes Data (fill with mocks if empty)
  const apiRoutesData = (data?.apiUsage?.topRoutes && data.apiUsage.topRoutes.length > 0)
    ? data.apiUsage.topRoutes
    : [
        { route: '/api/users/profile', requests: 154 },
        { route: '/api/interview/chat', requests: 120 },
        { route: '/api/goals', requests: 88 },
        { route: '/api/recommendations', requests: 74 },
        { route: '/api/resources', requests: 42 }
      ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{t('Analytics & Charts')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('Deep-dive into platform usage statistics, metrics, and traffic rates.')}</p>
      </div>

      {/* Row 1: Daily Requests & Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Requests (Area Chart) */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LineIcon className="text-primary-600" size={18} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('Daily API Requests')}</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiDailyData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderColor: '#E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                  className="dark:!bg-gray-800 dark:!border-gray-700"
                />
                <Area type="monotone" dataKey="requests" name={t('Requests')} stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Active Endpoints (Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-secondary-600" size={18} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('Top API Routes')}</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiRoutesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis dataKey="route" type="category" stroke="#9CA3AF" fontSize={10} tickLine={false} width={130} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderColor: '#E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="requests" name={t('Requests')} fill="#10B981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Users Roles & Goals Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Roles Pie Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-blue-500" size={18} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('User Roles Distribution')}</h3>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 text-sm">
              {roleData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Progress Pie Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-purple-500" size={18} />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('Goal Completion Rate')}</h3>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-sm">
              {goalData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{t('Overall Rate')}:</span>
                <span className="font-extrabold text-primary-600 dark:text-primary-400 ml-1">
                  {data?.goals?.rate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
