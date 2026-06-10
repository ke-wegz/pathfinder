import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import i18n, { normalizeLanguage } from '../i18n';
import {
  User,
  Shield,
  Bell,
  Lock,
  Database,
  ChevronRight,
  Download,
  Info,
  Sun,
  Moon,
  Mail,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Save,
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { value: 'en', labelKey: 'settings.languages.english' },
  { value: 'ar', labelKey: 'settings.languages.arabic' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Pacific Time (PT)', labelKey: 'settings.timezones.pt' },
  { value: 'Mountain Time (MT)', labelKey: 'settings.timezones.mt' },
  { value: 'Central Time (CT)', labelKey: 'settings.timezones.ct' },
  { value: 'Eastern Time (ET)', labelKey: 'settings.timezones.et' },
  { value: 'Greenwich Mean Time (GMT)', labelKey: 'settings.timezones.gmt' },
  { value: 'Central European Time (CET)', labelKey: 'settings.timezones.cet' },
  { value: 'Gulf Standard Time (GST)', labelKey: 'settings.timezones.gst' },
];

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Pacific Time (PT)');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalSaveSuccess, setGlobalSaveSuccess] = useState('');

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    dataCollection: true,
    shareProgress: false,
    showLocation: true,
    showEducation: true,
    showExperience: true,
    showSkills: true,
    showInterests: true,
    showEmail: true,
    showPhone: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    goalReminders: true,
    communityActivity: true,
    marketingCommunications: false,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
    if (user) setEmail(user.email || '');
    if (profile) {
      if (profile.language) setLanguage(normalizeLanguage(profile.language));
      if (profile.timezone) setTimezone(profile.timezone);
      if (profile.privacySettings) {
        setPrivacySettings((prev) => ({ ...prev, ...profile.privacySettings }));
      }
      if (profile.notificationSettings) setNotificationSettings(profile.notificationSettings);
    }
  }, [user, profile]);

  const saveAllSettings = async () => {
    setGlobalSaving(true);
    setGlobalSaveSuccess('');

    try {
      const updates = {
        language,
        timezone,
        privacySettings,
        notificationSettings,
      };

      await api.patch('/users/profile', updates);
      await i18n.changeLanguage(language);
      setProfile((prev) => ({ ...prev, ...updates }));
      setGlobalSaveSuccess(t('settings.settingsSaved'));
      setTimeout(() => setGlobalSaveSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert(t('settings.saveError'));
    } finally {
      setGlobalSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handlePrivacyToggle = (key) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMatchError'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordLengthError'));
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(t('settings.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || t('settings.passwordUpdateFailed'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetAllData = async () => {
    setResetLoading(true);

    try {
      localStorage.removeItem('pathfinder_recommendations');
      localStorage.removeItem('interviewAnswers');
      localStorage.removeItem('theme');
      sessionStorage.clear();

      await api.delete('/users/reset-data');
      alert(t('settings.resetSuccess'));
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert(t('settings.resetError'));
    } finally {
      setResetLoading(false);
      setShowResetConfirm(false);
      setResetConfirmText('');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    setGlobalSaving(true);

    try {
      await api.delete('/users/account');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(t('settings.deleteAccountFailed'));
    } finally {
      setGlobalSaving(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const handleDownloadData = () => {
    const userData = {
      user: {
        email: user?.email,
        uid: user?.uid,
        createdAt: user?.metadata?.creationTime,
      },
      profile,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${t('settings.downloadFilenamePrefix')}${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sections = [
    { id: 'account', labelKey: 'settings.sectionAccount', icon: User },
    { id: 'privacy', labelKey: 'settings.sectionPrivacy', icon: Shield },
    { id: 'notifications', labelKey: 'settings.sectionNotifications', icon: Bell },
    { id: 'security', labelKey: 'settings.sectionSecurity', icon: Lock },
    { id: 'data', labelKey: 'settings.sectionData', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-primary-600">
              {t('settings.dashboardBreadcrumb')}
            </button>
            <ChevronRight size={14} />
            <span>{t('settings.title')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.accountTitle')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('settings.accountDescription')}</p>
            </div>
            <div className="flex items-center gap-3">
              {globalSaveSuccess && (
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle size={16} /> {globalSaveSuccess}
                </span>
              )}
              <button
                type="button"
                onClick={saveAllSettings}
                disabled={globalSaving}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {globalSaving ? t('settings.saving') : <><Save size={18} /> {t('settings.saveSettings')}</>}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <Icon size={18} />
                      <span>{t(section.labelKey)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'account' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('settings.accountTitle')}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('settings.themePreference')}</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => !darkMode && toggleDarkMode()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${!darkMode
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                      >
                        <Sun size={18} />
                        {t('settings.light')}
                      </button>
                      <button
                        type="button"
                        onClick={() => darkMode && toggleDarkMode()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${darkMode
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                      >
                        <Moon size={18} />
                        {t('settings.dark')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('settings.emailAddress')}</label>
                    <div className="relative flex-1">
                      <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-600 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('settings.language')}</label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      <select
                        value={language}
                        onChange={(e) => setLanguage(normalizeLanguage(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      >
                        {LANGUAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('settings.timezone')}</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      >
                        {TIMEZONE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('settings.privacyTitle')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('settings.privacyDescription')}</p>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.profileVisibility')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.profileVisibilityDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.profileVisibility}
                        onChange={() => handlePrivacyToggle('profileVisibility')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.dataCollection')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.dataCollectionDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.dataCollection}
                        onChange={() => handlePrivacyToggle('dataCollection')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.shareProgress')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.shareProgressDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.shareProgress}
                        onChange={() => handlePrivacyToggle('shareProgress')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                {/* Detailed Privacy controls */}
                <div className={`space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${!privacySettings.profileVisibility ? 'opacity-50 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('settings.profileSharingPreferences', 'Profile Sharing Details')}</h4>
                  
                  {/* Location */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showLocation')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showLocationDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showLocation}
                        onChange={() => handlePrivacyToggle('showLocation')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  {/* Education */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showEducation')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showEducationDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEducation}
                        onChange={() => handlePrivacyToggle('showEducation')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showExperience')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showExperienceDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showExperience}
                        onChange={() => handlePrivacyToggle('showExperience')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Skills */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showSkills')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showSkillsDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showSkills}
                        onChange={() => handlePrivacyToggle('showSkills')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Interests */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showInterests')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showInterestsDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showInterests}
                        onChange={() => handlePrivacyToggle('showInterests')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Email */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showEmail')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showEmailDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={() => handlePrivacyToggle('showEmail')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.showPhone')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.showPhoneDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={() => handlePrivacyToggle('showPhone')}
                        disabled={!privacySettings.profileVisibility}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">{t('settings.privacyNoticeTitle')}</p>
                      <p className="text-blue-800 dark:text-blue-200">{t('settings.privacyNoticeBody')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('settings.notificationsTitle')}</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.emailNotifications')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.emailNotificationsDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationToggle('emailNotifications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.goalReminders')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.goalRemindersDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.goalReminders}
                        onChange={() => handleNotificationToggle('goalReminders')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.communityActivity')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.communityActivityDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.communityActivity}
                        onChange={() => handleNotificationToggle('communityActivity')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.marketingCommunications')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.marketingCommunicationsDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingCommunications}
                        onChange={() => handleNotificationToggle('marketingCommunications')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('settings.securityTitle')}</h2>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.changePassword')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.metadata?.lastSignInTime
                            ? t('settings.lastChanged', { date: new Date(user.metadata.lastSignInTime).toLocaleDateString() })
                            : t('settings.never')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t('settings.currentPassword')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('settings.newPassword')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('settings.confirmNewPassword')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                      />

                      {passwordError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} /> {passwordError}
                        </p>
                      )}
                      {passwordSuccess && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle size={14} /> {passwordSuccess}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={passwordLoading}
                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50"
                      >
                        {passwordLoading ? t('settings.updating') : t('settings.updatePassword')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('settings.dataManagementTitle')}</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('settings.downloadYourData')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.downloadDataDescription')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadData}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      {t('settings.download')}
                    </button>
                  </div>

                  <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <RefreshCw size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">{t('settings.resetAllData')}</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">{t('settings.resetAllDataDescription')}</p>

                        {!showResetConfirm ? (
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(true)}
                            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors flex items-center gap-2"
                          >
                            <RefreshCw size={16} />
                            {t('settings.resetAllData')}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                              {t('settings.typeResetConfirm')}
                            </p>
                            <input
                              type="text"
                              value={resetConfirmText}
                              onChange={(e) => setResetConfirmText(e.target.value)}
                              placeholder="RESET"
                              disabled={resetLoading}
                              className="w-full px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500"
                            />
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowResetConfirm(false);
                                  setResetConfirmText('');
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                {t('settings.cancel')}
                              </button>
                              <button
                                type="button"
                                onClick={resetAllData}
                                disabled={resetConfirmText !== 'RESET' || resetLoading}
                                className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {resetLoading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                {resetLoading ? t('settings.resetting') : t('settings.confirmReset')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">{t('settings.deleteAccount')}</h3>
                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">{t('settings.deleteAccountDescription')}</p>

                        {!showDeleteConfirm ? (
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                          >
                            {t('settings.deleteAccount')}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                              {t('settings.typeDeleteConfirm')}
                            </p>
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="DELETE"
                              className="w-full px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500"
                            />
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText('');
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                {t('settings.cancel')}
                              </button>
                              <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || globalSaving}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                              >
                                {globalSaving ? t('settings.deleting') : t('settings.permanentlyDelete')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
