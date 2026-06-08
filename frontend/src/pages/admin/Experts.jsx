import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  UserPlus, Trash2, ShieldAlert, AlertCircle, X,
  GraduationCap, BookOpen, Key, Loader2, Sparkles
} from 'lucide-react';

const Experts = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Expert Modal Form State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: '',
    education: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExperts = async () => {
    try {
      const res = await api.get('/admin/experts');
      setExperts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching experts:', err);
      setError(t('Failed to load experts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
    
    // Auto-open add expert modal if redirected with ?add=true query param
    if (location.search.includes('add=true')) {
      setAddModalOpen(true);
    }
  }, [location, t]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setFormError(t('Name, email, and password are required.'));
      setFormLoading(false);
      return;
    }

    try {
      await api.post('/admin/experts', formData);
      setFormData({
        name: '',
        email: '',
        password: '',
        skills: '',
        education: ''
      });
      setAddModalOpen(false);
      fetchExperts();
    } catch (err) {
      console.error('Error adding expert:', err);
      setFormError(err.response?.data?.message || t('Failed to add expert account.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpert) return;
    setDeleteLoading(true);
    setError('');

    try {
      await api.delete(`/admin/experts/${selectedExpert.uid}`);
      setDeleteModalOpen(false);
      setSelectedExpert(null);
      fetchExperts();
    } catch (err) {
      console.error('Error deleting expert:', err);
      setError(err.response?.data?.message || t('Failed to remove expert account.'));
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (expert) => {
    setSelectedExpert(expert);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedExpert(null);
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
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Manage Experts')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('Add, verify, or remove expert accounts.')}</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold hover:scale-105 transition-transform shadow-md shadow-primary-600/25"
        >
          <UserPlus size={18} />
          <span>{t('Onboard New Expert')}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Experts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
            {t('No experts onboarded yet.')}
          </div>
        ) : (
          experts.map((expert) => (
            <div key={expert.uid} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <button
                onClick={() => openDeleteModal(expert)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title={t('Remove Expert')}
              >
                <Trash2 size={16} />
              </button>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {(expert.name || 'E').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-950 dark:text-white">{expert.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{expert.email}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-4" />

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-450">
                    <GraduationCap size={14} className="text-green-500" />
                    <span>{t('Verified Career Advisor')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-450">
                    <BookOpen size={14} className="text-blue-500" />
                    <span>{t('Member since:')} {expert.createdAt ? new Date(expert.createdAt.toDate ? expert.createdAt.toDate() : expert.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                  {t('Expert Access')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expert Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-150 dark:border-gray-750 relative animate-scale-up">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-primary-600" />
              <span>{t('Onboard New Expert')}</span>
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Full Name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Rami K."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Email Address')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="rami@pathfinder.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Password')}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Skills (comma-separated)')}</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g. UX Design, CV Review, Career Counseling"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Education / Degree')}</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g. PhD in Human Resources"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-250 dark:border-gray-650 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="animate-spin" size={14} />}
                  <span>{t('Register Expert')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Remove Expert')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Are you sure you want to remove this expert account? Their verified profile and administrative privileges will be deleted permanently.')}
              <span className="block font-bold text-gray-850 dark:text-gray-105 mt-2">{selectedExpert?.name} ({selectedExpert?.email})</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-250 dark:border-gray-650 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5"
              >
                {deleteLoading && <Loader2 className="animate-spin" size={14} />}
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experts;
