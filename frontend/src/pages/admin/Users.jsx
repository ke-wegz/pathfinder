import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  Search, Check, ShieldAlert, Ban, UserCheck, Trash2,
  AlertCircle, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Confirmation Modal state
  const [modalType, setModalType] = useState(null); // 'disable' | 'enable' | 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
      setFilteredUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('Failed to load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [t]);

  // Search logic
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = users.filter(user => 
      (user.name || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.role || '').toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleAction = async () => {
    if (!selectedUser || !modalType) return;
    setActionLoading(true);
    setError('');

    try {
      if (modalType === 'disable') {
        await api.patch(`/admin/users/${selectedUser.uid}/disable`);
      } else if (modalType === 'enable') {
        await api.patch(`/admin/users/${selectedUser.uid}/enable`);
      } else if (modalType === 'delete') {
        await api.delete(`/admin/users/${selectedUser.uid}`);
      }

      await fetchUsers();
      closeModal();
    } catch (err) {
      console.error(`Error in admin ${modalType} user:`, err);
      setError(err.response?.data?.message || t('Operation failed. Please try again.'));
      setActionLoading(false);
    }
  };

  const openModal = (type, user) => {
    setModalType(type);
    setSelectedUser(user);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Manage Users')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('View, search, enable, disable, and delete user accounts.')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-3">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder={t('Search users by name, email, or role...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white focus:ring-0 text-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">{t('Name')}</th>
                <th className="px-6 py-4">{t('Email')}</th>
                <th className="px-6 py-4">{t('Role')}</th>
                <th className="px-6 py-4">{t('Status')}</th>
                <th className="px-6 py-4 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('No users found.')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserDisabled = user.disabled;
                  const roleLower = String(user.role || '').toLowerCase();
                  
                  // Role Styles
                  let roleBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                  if (roleLower === 'admin') {
                    roleBadge = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
                  } else if (roleLower === 'expert') {
                    roleBadge = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                  }

                  return (
                    <tr key={user.uid} className="hover:bg-gray-50/55 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {user.name || t('N/A')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadge}`}>
                          {user.role || 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isUserDisabled
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {isUserDisabled ? t('Disabled') : t('Active')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {/* Skip action buttons on current admin user self-modifications */}
                        {roleLower === 'admin' ? (
                          <span className="text-xs text-gray-400 italic">{t('System Protected')}</span>
                        ) : (
                          <>
                            {isUserDisabled ? (
                              <button
                                onClick={() => openModal('enable', user)}
                                className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                title={t('Enable User')}
                              >
                                <UserCheck size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal('disable', user)}
                                className="p-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                                title={t('Disable User')}
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openModal('delete', user)}
                              className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              title={t('Delete Account')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 capitalize">
              {t(`${modalType} User`)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {modalType === 'delete'
                ? t('Are you sure you want to permanently delete user account? This will wipe all their goals, recommendations, notifications, and profile details.')
                : t(`Are you sure you want to ${modalType} this user account?`)}
              <span className="block font-bold text-gray-850 dark:text-gray-105 mt-2">{selectedUser?.name} ({selectedUser?.email})</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-250 dark:border-gray-650 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  modalType === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
                    : modalType === 'disable'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20'
                    : 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20'
                }`}
              >
                {actionLoading && <Loader2 className="animate-spin" size={14} />}
                {t('Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
