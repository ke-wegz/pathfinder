import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare, Trash2, Search, X, Loader2, AlertCircle,
  Calendar, User, Heart, ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';

const Community = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  
  // Expanded post IDs (for showing comments)
  const [expandedPostIds, setExpandedPostIds] = useState(new Set());

  // Post Delete Modal State
  const [postDeleteModalOpen, setPostDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postDeleteLoading, setPostDeleteLoading] = useState(false);

  // Comment Delete Modal State
  const [commentDeleteModalOpen, setCommentDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null); // { commentId, postId }
  const [commentDeleteLoading, setCommentDeleteLoading] = useState(false);

  const topics = ['General', 'Career Advice', 'Resources', 'Success Story', 'Question', 'Interview Tips', 'Job Search'];

  const topicColors = {
    'Career Advice': 'bg-blue-100 dark:bg-blue-900/30 text-blue-750 dark:text-blue-300',
    'Resources': 'bg-green-100 dark:bg-green-900/30 text-green-750 dark:text-green-300',
    'Success Story': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-750 dark:text-yellow-300',
    'Question': 'bg-purple-100 dark:bg-purple-900/30 text-purple-750 dark:text-purple-300',
    'Interview Tips': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-750 dark:text-indigo-300',
    'Job Search': 'bg-orange-100 dark:bg-orange-900/30 text-orange-755 dark:text-orange-300',
    'General': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get('/admin/community/posts');
      const postsData = (res.data.data || []).map(doc => ({
        ...doc,
        id: doc._id || doc.id,
        likes: doc.likes || [],
        comments: doc.comments || []
      }));
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching admin community posts:', err);
      setError(t('Failed to load community posts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [t]);

  const formatTime = (timestamp) => {
    if (!timestamp) return t('Just now');

    if (typeof timestamp === 'object' && timestamp.seconds != null) {
      const date = new Date(timestamp.seconds * 1000);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / 60000);

      if (diffMinutes < 1) return t('Just now');
      if (diffMinutes < 60) return t('{{count}}m ago', { count: diffMinutes });
      if (diffMinutes < 1440) return t('{{count}}h ago', { count: Math.floor(diffMinutes / 60) });
      return date.toLocaleDateString();
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return t('Just now');

    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return t('Just now');
    if (diffMinutes < 60) return t('{{count}}m ago', { count: diffMinutes });
    if (diffMinutes < 1440) return t('{{count}}h ago', { count: Math.floor(diffMinutes / 60) });
    return date.toLocaleDateString();
  };

  const toggleComments = (postId) => {
    const next = new Set(expandedPostIds);
    if (next.has(postId)) {
      next.delete(postId);
    } else {
      next.add(postId);
    }
    setExpandedPostIds(next);
  };

  // --- Deletion Flow ---

  const openPostDeleteModal = (post) => {
    setPostToDelete(post);
    setPostDeleteModalOpen(true);
  };

  const handlePostDelete = async () => {
    if (!postToDelete) return;
    setPostDeleteLoading(true);
    setError('');

    try {
      await api.delete(`/admin/community/posts/${postToDelete.id}`);
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      setPostDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting community post:', err);
      setError(err.response?.data?.message || t('Failed to delete post.'));
      setPostDeleteModalOpen(false);
    } finally {
      setPostDeleteLoading(false);
    }
  };

  const openCommentDeleteModal = (comment, postId) => {
    setCommentToDelete({ ...comment, postId });
    setCommentDeleteModalOpen(true);
  };

  const handleCommentDelete = async () => {
    if (!commentToDelete) return;
    setCommentDeleteLoading(true);
    setError('');

    try {
      await api.delete(`/admin/community/posts/${commentToDelete.postId}/comments/${commentToDelete.id || commentToDelete._id}`);
      
      // Update local state to remove the comment from the UI and update count
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== commentToDelete.postId) return p;
          const updatedComments = (p.comments || []).filter(c => (c.id || c._id) !== (commentToDelete.id || commentToDelete._id));
          return {
            ...p,
            comments: updatedComments,
            comments_count: Math.max(0, (p.comments_count || 1) - 1)
          };
        })
      );

      setCommentDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.message || t('Failed to delete comment.'));
      setCommentDeleteModalOpen(false);
    } finally {
      setCommentDeleteLoading(false);
    }
  };

  // --- Search and Filters ---
  const filteredPosts = posts.filter(post => {
    const matchesTopic = filterTopic === 'All' || post.topic === filterTopic;
    const searchLower = search.toLowerCase();
    const matchesSearch = search === '' ||
      (post.text || '').toLowerCase().includes(searchLower) ||
      (post.author || '').toLowerCase().includes(searchLower) ||
      (post.authorEmail || '').toLowerCase().includes(searchLower);
    return matchesTopic && matchesSearch;
  });

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
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('Manage Community Board')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('Moderate community discussions. Delete inappropriate posts or specific comments.')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder={t('Search posts by content, author name, or email...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white focus:ring-0 text-sm"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Topic')}:</span>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer pr-8"
          >
            <option value="All">{t('All Topics')}</option>
            {topics.map(tOption => (
              <option key={tOption} value={tOption}>{t(tOption)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Listing */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            {t('No community posts found matching criteria.')}
          </div>
        ) : (
          filteredPosts.map(post => {
            const isExpanded = expandedPostIds.has(post.id);
            const commentsList = post.comments || [];
            
            return (
              <div key={post.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                
                {/* Main Post Section */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {/* Author Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                        {(post.author || post.authorEmail || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{post.author || 'Anonymous'}</span>
                          {post.authorEmail && (
                            <span className="text-xs text-gray-400">({post.authorEmail})</span>
                          )}
                          <span className="text-xs text-gray-500">• {formatTime(post.date || post.createdAt)}</span>
                          
                          {post.topic && (
                            <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${topicColors[post.topic] || topicColors['General']}`}>
                              {t(post.topic)}
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {post.text}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => openPostDeleteModal(post)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all self-start flex-shrink-0"
                      title={t('Delete Post')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Post Stats & Comment Toggle */}
                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-red-400" />
                      <span>{post.likes_count ?? post.likes?.length ?? 0} {t('likes')}</span>
                    </div>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span>{commentsList.length} {t('comments')}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Comments List (Conditional expansion) */}
                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700/80 px-6 py-4 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('Comments')}</h4>
                    
                    {commentsList.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 italic">{t('No comments on this post.')}</p>
                    ) : (
                      <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50 space-y-3">
                        {commentsList.map((comment, commentIdx) => (
                          <div key={comment.id || comment._id || commentIdx} className="flex items-start justify-between gap-4 pt-3 first:pt-0">
                            <div className="flex gap-2.5">
                              {/* Commenter Avatar */}
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold flex-shrink-0 text-xs">
                                {(comment.author || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{comment.author || 'Anonymous'}</span>
                                  <span className="text-3xs text-gray-400">{formatTime(comment.date || comment.createdAt)}</span>
                                </div>
                                <p className="mt-1 text-gray-650 dark:text-gray-300 text-xs break-words whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => openCommentDeleteModal(comment, post.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all flex-shrink-0"
                              title={t('Delete Comment')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Delete Post Modal */}
      {postDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-150 dark:border-gray-755 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Delete Community Post')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Are you sure you want to permanently delete this post? This will also delete all associated comments.')}
              <span className="block font-bold text-gray-850 dark:text-gray-105 mt-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 italic max-h-24 overflow-y-auto">
                "{postToDelete?.text}"
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPostDeleteModalOpen(false)}
                disabled={postDeleteLoading}
                className="px-4 py-2 border border-gray-250 dark:border-gray-655 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-705"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handlePostDelete}
                disabled={postDeleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5"
              >
                {postDeleteLoading && <Loader2 className="animate-spin" size={14} />}
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {commentDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-150 dark:border-gray-755 animate-scale-up">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Delete Comment')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Are you sure you want to delete this comment? This action cannot be undone.')}
              <span className="block font-bold text-gray-850 dark:text-gray-105 mt-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 italic max-h-24 overflow-y-auto">
                "{commentToDelete?.text}"
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCommentDeleteModalOpen(false)}
                disabled={commentDeleteLoading}
                className="px-4 py-2 border border-gray-250 dark:border-gray-655 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-705"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleCommentDelete}
                disabled={commentDeleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5"
              >
                {commentDeleteLoading && <Loader2 className="animate-spin" size={14} />}
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;
