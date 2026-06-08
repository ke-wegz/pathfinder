import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit, Trash2, Search, X, Loader2, AlertCircle,
  ExternalLink, BookOpen, Layers, Globe
} from 'lucide-react';

const Resources = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false); // Add/Edit Modal
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [selectedResource, setSelectedResource] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    type: 'course',
    url: '',
    topics: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await api.get('/admin/resources');
      setResources(res.data.data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(t('Failed to load resources.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    if (location.search.includes('add=true')) {
      openAddModal();
    }
  }, [location, t]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openAddModal = () => {
    setModalType('add');
    setSelectedResource(null);
    setFormData({
      name: '',
      provider: '',
      type: 'course',
      url: '',
      topics: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setModalType('edit');
    setSelectedResource(resource);
    setFormData({
      name: resource.name || '',
      provider: resource.provider || '',
      type: resource.type || 'course',
      url: resource.url || '',
      topics: Array.isArray(resource.topics) ? resource.topics.join(', ') : (resource.topics || '')
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formData.name || !formData.provider || !formData.url) {
      setFormError(t('Name, Provider, and URL are required.'));
      setFormLoading(false);
      return;
    }

    // Process topics string to array
    const topicsArray = formData.topics
      ? formData.topics.split(',').map(topic => topic.trim().toLowerCase()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      topics: topicsArray
    };

    try {
      if (modalType === 'add') {
        await api.post('/admin/resources', payload);
      } else {
        await api.put(`/admin/resources/${selectedResource.resourceId}`, payload);
      }
      setModalOpen(false);
      fetchResources();
    } catch (err) {
      console.error('Error saving resource:', err);
      setFormError(err.response?.data?.message || t('Failed to save resource.'));
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (resource) => {
    setSelectedResource(resource);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    setDeleteLoading(true);
    setError('');

    try {
      await api.delete(`/admin/resources/${selectedResource.resourceId}`);
      setDeleteModalOpen(false);
      setSelectedResource(null);
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError(err.response?.data?.message || t('Failed to delete resource.'));
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter resources based on search term
  const filteredResources = resources.filter(res => 
    (res.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (res.provider || '').toLowerCase().includes(search.toLowerCase()) ||
    (Array.isArray(res.topics) && res.topics.some(topic => topic.toLowerCase().includes(search.toLowerCase())))
  );

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
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Manage Learning Resources')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('Create, review, update, or remove online courses, articles, or books.')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold hover:scale-105 transition-transform shadow-md shadow-primary-600/25"
        >
          <Plus size={18} />
          <span>{t('Add New Resource')}</span>
        </button>
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
          placeholder={t('Search resources by title, provider, or topic...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white focus:ring-0 text-sm"
        />
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">{t('Resource Title')}</th>
                <th className="px-6 py-4">{t('Provider')}</th>
                <th className="px-6 py-4">{t('Type')}</th>
                <th className="px-6 py-4">{t('Topics')}</th>
                <th className="px-6 py-4 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('No resources found.')}
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.resourceId} className="hover:bg-gray-50/55 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <span>{res.name}</span>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {res.provider}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 capitalize">
                        {t(res.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(res.topics) ? (
                          res.topics.map((topic, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-650 dark:text-gray-300 rounded text-xs">
                              {topic}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(res)}
                        className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                        title={t('Edit Resource')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(res)}
                        className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        title={t('Delete Resource')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-150 dark:border-gray-755 relative animate-scale-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-primary-600" />
              <span>{modalType === 'add' ? t('Add New Resource') : t('Edit Resource')}</span>
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Resource Title')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Complete Python Bootcamp"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Provider')}</label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    placeholder="e.g. Coursera / Udemy"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Type')}</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="course">{t('Course')}</option>
                    <option value="book">{t('Book')}</option>
                    <option value="article">{t('Article')}</option>
                    <option value="certification">{t('Certification')}</option>
                    <option value="video">{t('Video')}</option>
                    <option value="tool">{t('Tool')}</option>
                    <option value="center">{t('Learning Center')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Resource URL')}</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t('Topics (comma-separated)')}</label>
                <input
                  type="text"
                  name="topics"
                  value={formData.topics}
                  onChange={handleInputChange}
                  placeholder="e.g. python, programming, backend"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-250 dark:border-gray-655 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="animate-spin" size={14} />}
                  <span>{modalType === 'add' ? t('Add Resource') : t('Save Changes')}</span>
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
              {t('Delete Resource')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Are you sure you want to permanently delete this learning resource? This will remove it from all matching recommendations dashboards.')}
              <span className="block font-bold text-gray-850 dark:text-gray-105 mt-2">{selectedResource?.name}</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-250 dark:border-gray-655 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
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

export default Resources;
