import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Mail, Lock, LogIn, ArrowRight, Eye, EyeOff,
    Github, AlertCircle, CheckCircle, Compass,
    ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Removed auto-redirect to avoid race conditions

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!email || !password) {
            setError(t('Please fill in all fields'));
            return;
        }

        if (!email.includes('@')) {
            setError(t('Please enter a valid email address'));
            return;
        }

        setLoading(true);

        try {
            await login(email, password);

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }

            setSuccess(t('Login successful! Redirecting...'));
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('Invalid email or password');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        // In production, implement social login with Firebase
        alert(t(`${provider} login coming soon!`));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                            <Compass size={22} className="text-white" />
                        </div>
                        PathFinder AI
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 mb-4">
                        <LogIn size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Welcome Back')}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('Sign in to continue your career journey')}</p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Email Address')}
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('Password')}
                                </label>
                                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                    {t('Forgot password?')}
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('Remember me')}
                                </label>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
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

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">{t('Or continue with')}</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSocialLogin('Google')}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button
                            onClick={() => handleSocialLogin('GitHub')}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Github size={18} />
                            <span className="text-sm font-medium">GitHub</span>
                        </button>
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    {t("Don't have an account?")}{' '}
                    <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                        {t('Sign up for free')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;