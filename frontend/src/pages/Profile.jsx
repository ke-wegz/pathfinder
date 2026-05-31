import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Camera, Edit2, Plus, X, CheckCircle, Circle,
    ChevronRight, Mail, Phone, MapPin, GraduationCap, Heart, Target,
    Briefcase, Code, BookOpen, Users, Save, AlertCircle, Loader
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const { user, profile, setProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        education: '',
        skills: [],
        interests: [],
        careerGoals: [],
        experience: ''
    });
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newGoal, setNewGoal] = useState('');
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    // Load profile data
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || user?.name || '',
                email: profile.email || user?.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                education: profile.education || '',
                skills: profile.skills || [],
                interests: profile.interests || [],
                careerGoals: profile.careerGoals || [],
                experience: profile.experience || ''
            });
        }
    }, [profile, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skill)
        });
    };

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
            setFormData({
                ...formData,
                interests: [...formData.interests, newInterest.trim()]
            });
            setNewInterest('');
        }
    };

    const removeInterest = (interest) => {
        setFormData({
            ...formData,
            interests: formData.interests.filter(i => i !== interest)
        });
    };

    const addCareerGoal = () => {
        if (newGoal.trim() && !formData.careerGoals.includes(newGoal.trim())) {
            setFormData({
                ...formData,
                careerGoals: [...formData.careerGoals, newGoal.trim()]
            });
            setNewGoal('');
        }
    };

    const removeCareerGoal = (goal) => {
        setFormData({
            ...formData,
            careerGoals: formData.careerGoals.filter(g => g !== goal)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const updatedProfile = {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                education: formData.education,
                experience: formData.experience,
                skills: formData.skills,
                interests: formData.interests,
                careerGoals: formData.careerGoals
            };

            await api.patch('/users/profile', updatedProfile);

            // Fetch the latest profile and set it
            const res = await api.get('/users/profile');
            const newProfileData = res.data.data;

            setProfile({
                name: newProfileData.name,
                email: newProfileData.email,
                location: newProfileData.location || '',
                skills: newProfileData.skills || [],
                interests: newProfileData.interests || [],
                careerGoals: newProfileData.careerGoals || [],
                experience: newProfileData.experience || '',
                education: Array.isArray(newProfileData.education) ? newProfileData.education.join(', ') : (newProfileData.education || ''),
                phone: newProfileData.phone || ''
            });

            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            const apiMessage =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message;

            setError(`${t('Failed to save profile:')} ${apiMessage || t('Unknown error')}`);
        } finally {
            setSaving(false);
        }
    };

    const profileCompletion = () => {
        let completed = 0;
        let total = 7;
        if (formData.name) completed++;
        if (formData.email) completed++;
        if (formData.location) completed++;
        if (formData.education) completed++;
        if (formData.skills.length > 0) completed++;
        if (formData.interests.length > 0) completed++;
        if (formData.careerGoals.length > 0) completed++;
        return Math.round((completed / total) * 100);
    };

    const completion = profileCompletion();
    const initials = (formData.name || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <a href="/dashboard" className="hover:text-primary-600">{t('Dashboard')}</a>
                        <ChevronRight size={14} />
                        <span>{t('Profile')}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('My Profile', 'My Profile')}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('Manage your personal information and career preferences', 'Manage your personal information and career preferences')}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Edit2 size={16} />
                            {isEditing ? t('Cancel', 'Cancel') : t('Edit Profile', 'Edit Profile')}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-600 relative">
                        <button className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors">
                            <Camera size={14} className="inline mr-1" />
                            Change Cover
                        </button>
                    </div>

                    <div className="px-8 pb-8 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-4xl font-bold">
                                    {initials}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{formData.name || 'Your Name'}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{formData.email}</p>
                                {formData.location && (
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {formData.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <div className="text-2xl font-bold text-primary-600">{completion}%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Profile Complete')}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-secondary-600">{formData.skills.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Skills</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary-600">{formData.careerGoals.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Career Goals</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">{t('Basic Information', 'Basic Information')}</h3>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Full Name')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Phone')}</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Location')}</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={t('City, Country')}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Education & Experience */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap size={18} className="text-primary-600" />
                            {t('Education & Experience', 'Education & Experience')}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Education</label>
                                <textarea
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={2}
                                    placeholder="e.g., Bachelor's in Computer Science, University of Jordan (2023)"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('Work Experience')}</label>
                                <textarea
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    placeholder="e.g., Software Engineer at Tech Company (2022-Present), Intern at Startup (2021)"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Code size={18} className="text-primary-600" />
                                {t('Skills', 'Skills')}
                            </h3>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        placeholder={t('Add skill...')}
                                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                    />
                                    <button type="button" onClick={addSkill} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm">
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-2">
                                    {skill}
                                    {isEditing && (
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {formData.skills.length === 0 && (
                                <p className="text-sm text-gray-500">No skills added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Heart size={18} className="text-secondary-600" />
                                {t('Interests', 'Interests')}
                            </h3>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                        placeholder="Add interest..."
                                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                    />
                                    <button type="button" onClick={addInterest} className="px-3 py-2 bg-secondary-600 text-white rounded-lg text-sm">
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest, i) => (
                                <span key={i} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-2">
                                    {interest}
                                    {isEditing && (
                                        <button type="button" onClick={() => removeInterest(interest)} className="hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {formData.interests.length === 0 && (
                                <p className="text-sm text-gray-500">No interests added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Career Goals */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Target size={18} className="text-primary-600" />
                                {t('Career Goals', 'Career Goals')}
                            </h3>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addCareerGoal()}
                                        placeholder="Add goal..."
                                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                                    />
                                    <button type="button" onClick={addCareerGoal} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm">
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {formData.careerGoals.map((goal, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                    <span className="flex-1 text-gray-700 dark:text-gray-300">{goal}</span>
                                    {isEditing && (
                                        <button type="button" onClick={() => removeCareerGoal(goal)} className="text-gray-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.careerGoals.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No career goals added yet</p>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <><Loader size={16} className="animate-spin" /> {t('Saving...', 'Saving...')}</> : <><Save size={16} /> {t('Save Changes', 'Save Changes')}</>}
                            </button>
                        </div>
                    )}

                    {showSuccess && (
                        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                            Profile updated successfully!
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
