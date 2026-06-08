import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import {
  Mail, Lock, LogIn, ArrowRight, Eye, EyeOff,
  AlertCircle, CheckCircle, Compass, ShieldAlert
} from 'lucide-react';

const AdminLogin = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError(t('Please fill in all fields'));
      return;
    }

    setLoading(true);

    try {
      // 1. Log in with Firebase
      await login(email, password);

      // 2. Fetch profile directly to check role before letting user in
      const profileRes = await api.get('/users/profile');
      const role = profileRes.data?.data?.role?.toLowerCase();

      if (role !== 'admin') {
        // Force sign out if not admin
        await logout();
        setError(t('Access denied: User is not an administrator.'));
        setLoading(false);
        return;
      }

      setSuccess(t('Login successful! Redirecting to dashboard...'));
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Admin login error:', err);
      // Firebase error mappings or general error
      const message = err.response?.data?.message || err.message || t('Invalid email or password');
      setError(message.includes('auth/') ? t('Invalid email or password') : message);
      setLoading(false);
    }
  };

  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-primary-600 rounded-xl flex items-center justify-center">
              <Compass size={22} className="text-white" />
            </div>
            PathFinder Admin
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-primary-600 mb-4 shadow-lg shadow-red-500/20">
            <ShieldAlert size={32} className="text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('Admin Sign In')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('Secure access to administrative dashboard')}</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 transform transition-all hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('Email Address')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="admin@pathfinder.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('Password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-shake">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-primary-600 hover:from-red-700 hover:to-primary-700 text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('Signing in...')}
                </>
              ) : (
                <>
                  {t('Sign In')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center gap-1.5">
            <ArrowRight size={14} className="rotate-180" />
            {t('Back to Landing Page')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
