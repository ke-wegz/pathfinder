import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Users, MessageSquare, Heart, Share2, Bookmark,
    ChevronRight, Plus, Search, Filter, Award,
    TrendingUp, Clock, ThumbsUp, MessageCircle,
    Send, Image, Link, X, Flag, Edit2, Trash2,
    Star, Sparkles, User, Calendar
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Community = () => {
    const { t } = useTranslation();
    const { user, profile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostText, setNewPostText] = useState('');
    const [newPostTopic, setNewPostTopic] = useState('General');
    const [filterTopic, setFilterTopic] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [posting, setPosting] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const commentInputRef = useRef(null);

    const topics = ['General', 'Career Advice', 'Resources', 'Success Story', 'Question', 'Interview Tips', 'Job Search'];

    const topicColors = {
        'Career Advice': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'Resources': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        'Success Story': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        'Question': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        'Interview Tips': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        'Job Search': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        'General': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };

    const topicIcons = {
        'Career Advice': Briefcase,
        'Resources': BookOpen,
        'Success Story': Award,
        'Question': HelpCircle,
        'Interview Tips': MessageSquare,
        'Job Search': Search,
        'General': Users
    };

    useEffect(() => {
        if (!user) return;

        const fetchPosts = async () => {
            try {
                const res = await api.get('/community/posts');
                const postsData = res.data.data.map(doc => ({
                    ...doc,
                    id: doc._id,
                    likes: doc.likes || [],
                    comments: doc.comments || []
                }));
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user]);

    const handlePost = async () => {
        if (!newPostText.trim()) return;

        setPosting(true);
        try {
            const res = await api.post('/community/posts', {
                text: newPostText.trim(),
                topic: newPostTopic,
                author: profile?.name || user?.name || user?.email?.split('@')[0] || 'Anonymous',
                authorEmail: user.email,
                authorAvatar: (profile?.name || user?.name || user?.email || 'U').charAt(0).toUpperCase(),
            });

            const newPost = { ...res.data.data, id: res.data.data._id, likes: [], comments: [] };
            setPosts([newPost, ...posts]);
            setNewPostText('');
            setNewPostTopic('General');
            setShowPostModal(false);
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            await api.post(`/community/posts/${postId}/like`);

            // Refresh the post from the backend so the UI matches idempotent "like only once" behavior
            const res = await api.get(`/community/posts/${postId}`);
            const updated = res.data.data;

            setPosts(prev =>
                prev.map(p => (p.id === postId ? { ...p, ...updated, likes: updated.likes || p.likes } : p))
            );
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;

        try {
            const res = await api.post(`/community/posts/${postId}/comments`, {
                text: commentText.trim(),
                author: profile?.name || user?.name || user?.email?.split('@')[0] || 'Anonymous',
                authorEmail: user.email,
                authorAvatar: (profile?.name || user?.name || user?.email || 'U').charAt(0).toUpperCase(),
            });

            const created = res?.data?.data;
            const newComment = created
                ? {
                    id: created.id || created._id,
                    text: created.text ?? commentText.trim(),
                    author: created.author || profile?.name || user?.name || user?.email?.split('@')[0] || 'Anonymous',
                    createdAt: created.createdAt || created.date || new Date().toISOString()
                }
                : {
                    id: Date.now().toString(),
                    text: commentText.trim(),
                    author: profile?.name || user?.name || user?.email?.split('@')[0] || 'Anonymous',
                    createdAt: new Date().toISOString()
                };

            setPosts(prev =>
                prev.map(p => {
                    if (p.id !== postId) return p;
                    return { ...p, comments: [...(p.comments || []), newComment] };
                })
            );

            setCommentText('');
            setSelectedPost(null);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm(t('Are you sure you want to delete this post?'))) {
            try {
                await api.delete(`/community/posts/${postId}`);
                setPosts(posts.filter(p => p.id !== postId));
                setSelectedPost(null);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return t('Just now');

        // Firestore timestamp-like: { seconds, nanoseconds } or { seconds }
        if (typeof timestamp === 'object' && timestamp.seconds != null) {
            const date = new Date(timestamp.seconds * 1000);
            const now = new Date();
            const diffMinutes = Math.floor((now - date) / 60000);

            if (diffMinutes < 1) return t('Just now');
            if (diffMinutes < 60) return t('{{count}}m ago', { count: diffMinutes });
            if (diffMinutes < 1440) return t('{{count}}h ago', { count: Math.floor(diffMinutes / 60) });
            return date.toLocaleDateString();
        }

        const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
        if (Number.isNaN(date.getTime())) return t('Just now');

        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 60000);

        if (diffMinutes < 1) return t('Just now');
        if (diffMinutes < 60) return t('{{count}}m ago', { count: diffMinutes });
        if (diffMinutes < 1440) return t('{{count}}h ago', { count: Math.floor(diffMinutes / 60) });
        return date.toLocaleDateString();
    };

    const filteredPosts = posts.filter(post => {
        const matchesTopic = filterTopic === 'All' || post.topic === filterTopic;
        const matchesSearch = searchTerm === '' ||
            post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTopic && matchesSearch;
    });

    const sidebarStats = React.useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const postsToday = posts.filter(p => {
            if (!p.date) return false;
            const d = new Date(p.date);
            return d >= startOfToday;
        }).length;

        const activeDiscussions = posts.filter(p => (p.comments?.length || 0) > 0).length;

        return {
            totalMembers: (new Set(posts.map(p => p.authorEmail || p.author).filter(Boolean))).size || posts.length || 0,
            postsToday,
            activeDiscussions
        };
    }, [posts]);

    const trendingTopics = React.useMemo(() => {
        const counts = new Map();
        for (const p of posts) {
            if (!p.topic) continue;
            counts.set(p.topic, (counts.get(p.topic) || 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [posts]);

    const topContributors = React.useMemo(() => {
        const counts = new Map();
        for (const p of posts) {
            const key = p.authorEmail || p.author || 'Unknown';
            counts.set(key, (counts.get(key) || 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, contributions]) => ({
                name,
                contributions,
                avatar: name?.charAt(0).toUpperCase() || 'U'
            }));
    }, [posts]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Community')}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Users size={28} className="text-primary-600" />
                                {t('Community')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('Connect with peers, share insights, and grow together')}</p>
                        </div>
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-primary-600/25 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            {t('Create Post')}
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('Search posts, topics, or authors...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Topic Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setFilterTopic('All')}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterTopic === 'All'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                                    }`}
                            >
                                {t('All Topics')}
                            </button>
                            {topics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setFilterTopic(topic)}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterTopic === topic
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                                        }`}
                                >
                                    {t(topic)}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 skeleton rounded-full"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 skeleton rounded w-1/4"></div>
                                                <div className="h-3 skeleton rounded w-full"></div>
                                                <div className="h-3 skeleton rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No posts found')}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{t('Be the first to start a conversation!')}</p>
                            </div>
                        ) : (
                            filteredPosts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Post Header */}
                                    <div className="p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {post.authorAvatar || post.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
                                                    <span className="text-xs text-gray-500">• {formatTime(post.createdAt)}</span>
                                                    {post.topic && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${topicColors[post.topic]}`}>
                                                            {t(post.topic)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.text}</p>

                                                {/* Post Actions */}
                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                    <button
                                                        onClick={() => handleLike(post.id)}
                                                        className={`flex items-center gap-1.5 text-sm transition-colors ${post.likes?.includes(user?.uid)
                                                            ? 'text-red-500'
                                                            : 'text-gray-500 hover:text-red-500'
                                                            }`}
                                                    >
                                                        <Heart size={16} className={post.likes?.includes(user?.uid) ? 'fill-current' : ''} />
                                                        <span>{post.likes_count ?? post.likes?.length ?? 0}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                                                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                                                    >
                                                        <MessageCircle size={16} />
                                                        <span>{post.comments?.length || 0}</span>
                                                    </button>
                                                    {post.authorEmail === user?.email && (
                                                        <button
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors ml-auto"
                                                        >
                                                            <Trash2 size={16} />
                                                            {t('Delete')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    {selectedPost?.id === post.id && (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700">
                                            {/* Comments List */}
                                            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                                {post.comments?.length === 0 ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('No comments yet. Be the first!')}</p>
                                                ) : (
                                                    post.comments?.map(comment => (
                                                        <div key={comment.id} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                                {comment.authorAvatar || comment.author.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.author}</span>
                                                                    <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Add Comment */}
                                            <div className="flex gap-2">
                                                <input
                                                    ref={commentInputRef}
                                                    type="text"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                    placeholder={t('Write a comment...')}
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                                                />
                                                <button
                                                    onClick={() => handleComment(post.id)}
                                                    disabled={!commentText.trim()}
                                                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary-600" />
                                {t('Community Stats')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('Total Members')}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{sidebarStats.totalMembers}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('Posts Today')}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{sidebarStats.postsToday}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('Active Discussions')}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{sidebarStats.activeDiscussions}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trending Topics */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-yellow-500" />
                                {t('Trending Topics')}
                            </h3>
                            <div className="space-y-3">
                                {trendingTopics.map((topic, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setFilterTopic(topic.name)}
                                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{t(topic.name)}</span>
                                        <span className="text-xs text-gray-500">{t('{{count}} posts', { count: topic.count })}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award size={18} className="text-yellow-500" />
                                {t('Top Contributors')}
                            </h3>
                            <div className="space-y-3">
                                {topContributors.map((contributor, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-bold">
                                            {contributor.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{contributor.name}</p>
                                            <p className="text-xs text-gray-500">{t('{{count}} contributions', { count: contributor.contributions })}</p>
                                        </div>
                                        <Star size={14} className="text-yellow-500" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('Community Guidelines')}</h3>
                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                <li>• {t('Be respectful and kind')}</li>
                                <li>• {t('No spam or self-promotion')}</li>
                                <li>• {t('Share valuable insights')}</li>
                                <li>• {t('Help others grow')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Create New Post')}</h2>
                            <button
                                onClick={() => setShowPostModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Topic')}</label>
                                <select
                                    value={newPostTopic}
                                    onChange={(e) => setNewPostTopic(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                >
                                    {topics.map(topic => (
                                        <option key={topic} value={topic}>{t(topic)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t("What's on your mind?")}</label>
                                <textarea
                                    value={newPostText}
                                    onChange={(e) => setNewPostText(e.target.value)}
                                    rows={5}
                                    placeholder={t('Share your thoughts, questions, or experiences...')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowPostModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={handlePost}
                                    disabled={posting || !newPostText.trim()}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    {posting ? t('Posting...') : t('Post')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper components for icons
const Briefcase = ({ size, className }) => <Briefcase size={size} className={className} />;
const BookOpen = ({ size, className }) => <BookOpen size={size} className={className} />;
const AwardIcon = ({ size, className }) => <Award size={size} className={className} />;
const HelpCircle = ({ size, className }) => <HelpCircle size={size} className={className} />;
const SearchIcon = ({ size, className }) => <Search size={size} className={className} />;

export default Community;