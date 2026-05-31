import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { normalizeGoal } from '../utils/goalUtils';
import {
    Target, Plus, CheckCircle, Circle, Trash2,
    ChevronRight, Calendar, Clock, Flag,
    Filter, Search, BarChart3, TrendingUp, Award,
    Sparkles, Rocket, BookOpen, Briefcase, Code, Users,
    Edit2, Save, X, Loader
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Goals = () => {
    const { t } = useTranslation();
    const { user, goals, setGoals } = useAuth();
    const [filter, setFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [newGoalText, setNewGoalText] = useState('');
    const [newGoalPriority, setNewGoalPriority] = useState('medium');
    const [newGoalCategory, setNewGoalCategory] = useState('Career');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);

    const categories = [
        { name: 'Career', icon: Briefcase, color: 'primary' },
        { name: 'Academic', icon: BookOpen, color: 'secondary' },
        { name: 'Skill', icon: Code, color: 'primary' },
        { name: 'Personal', icon: Users, color: 'secondary' }
    ];

    const priorities = [
        { name: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' },
        { name: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
        { name: 'high', label: 'High', color: 'bg-red-100 text-red-600', border: 'border-red-200' }
    ];

    // Goals are now loaded from AuthContext, but we might want a refresh function
    // For now, we rely on the context's initial load

    const addGoal = async () => {
        if (!newGoalText.trim()) return;

        setAdding(true);
        try {
            const res = await api.post('/goals', {
                text: newGoalText.trim(),
                priority: newGoalPriority,
                category: newGoalCategory,
                deadline: newGoalDeadline || null,
            });

            setGoals([normalizeGoal(res.data.data), ...goals]);
            resetForm();
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding goal:', error);
        } finally {
            setAdding(false);
        }
    };

    const updateGoal = async () => {
        if (!editingGoal || !newGoalText.trim()) return;

        setUpdating(true);
        try {
            const res = await api.put(`/goals/${editingGoal._id}`, {
                text: newGoalText.trim(),
                priority: newGoalPriority,
                category: newGoalCategory,
                deadline: newGoalDeadline || null,
            });

            setGoals(goals.map(g => g._id === editingGoal._id ? normalizeGoal(res.data.data) : g));
            resetForm();
            setEditingGoal(null);
        } catch (error) {
            console.error('Error updating goal:', error);
        } finally {
            setUpdating(false);
        }
    };

    const toggleGoal = async (goal) => {
        try {
            const res = await api.put(`/goals/${goal._id}`, {
                completed: !goal.completed
            });
            setGoals(goals.map(g => g._id === goal._id ? normalizeGoal(res.data.data) : g));
        } catch (error) {
            console.error('Error toggling goal:', error);
        }
    };

    const deleteGoal = async (goalId) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await api.delete(`/goals/${goalId}`);
                setGoals(goals.filter(g => g._id !== goalId));
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        }
    };

    const editGoal = (goal) => {
        setEditingGoal(goal);
        setNewGoalText(goal.text);
        setNewGoalPriority(goal.priority || 'medium');
        setNewGoalCategory(goal.category || 'Career');
        setNewGoalDeadline(goal.deadline || '');
    };

    const resetForm = () => {
        setNewGoalText('');
        setNewGoalPriority('medium');
        setNewGoalCategory('Career');
        setNewGoalDeadline('');
    };

    const filteredGoals = goals.filter(goal => {
        if (filter === 'active') return !goal.completed;
        if (filter === 'completed') return goal.completed;
        if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false;
        if (searchTerm && !goal.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: goals.length,
        completed: goals.filter(g => g.completed).length,
        active: goals.filter(g => !g.completed).length,
        highPriority: goals.filter(g => g.priority === 'high' && !g.completed).length,
        completionRate: goals.length ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100) : 0
    };

    const getPriorityStyle = (priority) => {
        return priorities.find(p => p.name === priority) || priorities[1];
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.name === category);
        return cat?.icon || Target;
    };

    const getCategoryColor = (category) => {
        const colors = {
            Career: 'bg-primary-100 text-primary-600',
            Academic: 'bg-secondary-100 text-secondary-600',
            Skill: 'bg-blue-100 text-blue-600',
            Personal: 'bg-purple-100 text-purple-600'
        };
        return colors[category] || 'bg-gray-100 text-gray-600';
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return null;
        const parsedDate = new Date(deadline);
        if (Number.isNaN(parsedDate.getTime())) return null;
        const today = new Date();
        const diffDays = Math.ceil((parsedDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500' };
        if (diffDays === 0) return { text: 'Today', color: 'text-orange-500' };
        if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-500' };
        if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-green-500' };
        return { text: parsedDate.toLocaleDateString(), color: 'text-gray-500' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Goals')}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Goals & Milestones')}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('Track your academic and career progress')}</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setEditingGoal(null);
                                setShowAddModal(true);
                            }}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-primary-600/25 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            {t('Add Goal')}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Target size={20} className="text-primary-600" />
                            <span className="text-xs text-gray-500">{stats.completionRate}%</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}/{stats.total}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Goals Completed')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Clock size={20} className="text-secondary-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Active Goals')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <Flag size={20} className="text-red-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('High Priority')}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={20} className="text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{t('Completion Rate')}</div>
                    </div>
                </div>

                {/* Progress Bar */}
                {goals.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Overall Progress')}</span>
                            <span className="text-sm font-bold text-primary-600">{stats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {stats.completed} {t('of')} {stats.total} {t('goals completed')}
                        </p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Search goals...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                            >
                                <option value="all">{t('All Goals')}</option>
                                <option value="active">{t('Active')}</option>
                                <option value="completed">{t('Completed')}</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                            >
                                <option value="all">{t('All Categories')}</option>
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{t(cat.name)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Goals List */}
                <div className="space-y-3">
                    {filteredGoals.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Target size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('No goals found')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('Start by adding your first goal')}</p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setEditingGoal(null);
                                    setShowAddModal(true);
                                }}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform"
                            >
                                {t('Add Your First Goal')}
                            </button>
                        </div>
                    ) : (
                        filteredGoals.map(goal => {
                            const CategoryIcon = getCategoryIcon(goal.category);
                            const priorityStyle = getPriorityStyle(goal.priority);
                            const deadlineInfo = formatDeadline(goal.deadline);

                            return (
                                <div
                                    key={goal._id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-all hover:shadow-md ${goal.completed ? 'opacity-70' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleGoal(goal)}
                                            className="mt-0.5 flex-shrink-0"
                                        >
                                            {goal.completed ? (
                                                <CheckCircle size={22} className="text-green-500" />
                                            ) : (
                                                <Circle size={22} className="text-gray-300 hover:text-primary-500 transition-colors" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(goal.category)}`}>
                                                    <CategoryIcon size={12} />
                                                    {t(goal.category)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${priorityStyle.color}`}>
                                                    <Flag size={12} />
                                                    {t(priorityStyle.label)}
                                                </span>
                                                {deadlineInfo && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${deadlineInfo.color}`}>
                                                        <Calendar size={12} />
                                                        {deadlineInfo.text}
                                                    </span>
                                                )}
                                            </div>

                                            <p className={`font-medium text-gray-900 dark:text-white ${goal.completed ? 'line-through text-gray-400' : ''}`}>
                                                {goal.text}
                                            </p>

                                            {goal.createdAt && (
                                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {t('Added')} {new Date(goal.createdAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => editGoal(goal)}
                                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteGoal(goal._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add/Edit Goal Modal */}
            {(showAddModal || editingGoal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingGoal ? t('Edit Goal') : t('Add New Goal')}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingGoal(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('What do you want to achieve?')}</label>
                                <textarea
                                    value={newGoalText}
                                    onChange={(e) => setNewGoalText(e.target.value)}
                                    rows={3}
                                    placeholder={t('e.g., Complete AWS certification by June 2025')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Category')}</label>
                                    <select
                                        value={newGoalCategory}
                                        onChange={(e) => setNewGoalCategory(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.name} value={cat.name}>{t(cat.name)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Priority')}</label>
                                    <select
                                        value={newGoalPriority}
                                        onChange={(e) => setNewGoalPriority(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                    >
                                        {priorities.map(p => (
                                            <option key={p.name} value={p.name}>{t(p.label)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Deadline (Optional)')}</label>
                                <input
                                    type="date"
                                    value={newGoalDeadline}
                                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingGoal(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={editingGoal ? updateGoal : addGoal}
                                    disabled={adding || updating || !newGoalText.trim()}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {(adding || updating) ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editingGoal ? t('Update Goal') : t('Add Goal')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;