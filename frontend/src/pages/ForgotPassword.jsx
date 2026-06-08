import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Compass, Key, Mail, Lock, Eye, EyeOff,
    ArrowRight, AlertCircle, CheckCircle, Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Steps: 1 = Enter Email, 2 = Verify OTP, 3 = Reset Password
    const [step, setStep] = useState(1);
    const [resendTimer, setResendTimer] = useState(0);
    
    const navigate = useNavigate();

    // Timer countdown effect for OTP resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const validatePassword = (pass) => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /\d/.test(pass);
        const isValidLength = pass.length >= 8;

        return {
            isValid: isValidLength && (hasUpperCase || hasLowerCase) && hasNumbers,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            isValidLength
        };
    };

    // Step 1: Request Password Reset OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError(t('Please fill in all fields'));
            return;
        }

        if (!email.includes('@')) {
            setError(t('Please enter a valid email address'));
            return;
        }

        setLoading(true);

        try {
            await api.post('/users/otp/send-forgot-password', { email });
            setSuccess(t('Password reset code sent successfully!'));
            setStep(2);
            setResendTimer(60);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('Failed to send verification code. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Reset OTP code
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp || otp.length !== 6) {
            setError(t('Please enter the 6-digit verification code'));
            return;
        }

        setLoading(true);

        try {
            // Reusing existing verification route
            await api.post('/users/otp/verify', { email, otp });
            setSuccess(t('Email verified successfully'));
            setStep(3);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('Verification failed. Invalid or expired code.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP code
    const handleResendOTP = async () => {
        if (resendTimer > 0 || loading) return;
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/users/otp/send-forgot-password', { email });
            setSuccess(t('A new verification code has been sent to your email.'));
            setResendTimer(60);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('Failed to resend code. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset user password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!password || !confirmPassword) {
            setError(t('Please fill in all fields'));
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(t('Password must be at least 8 characters with letters and numbers'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('Passwords do not match'));
            return;
        }

        setLoading(true);

        try {
            await api.post('/users/otp/reset-password', { email, password });
            setSuccess(t('Password reset successfully! Redirecting...'));
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('Password reset failed. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const passwordValidation = validatePassword(password);

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
                        <Key size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {step === 1 && t('Forgot password?')}
                        {step === 2 && t('Verify Your Email')}
                        {step === 3 && t('Reset Your Password')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {step === 1 && t('Enter your email to receive a password reset code')}
                        {step === 2 && t('Enter the code we sent to complete your verification')}
                        {step === 3 && t('Enter and confirm your new password below')}
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    {/* Step 1: Input Email */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-5">
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
                                        {t('Sending...')}
                                    </>
                                ) : (
                                    <>
                                        {t('Send Reset Code')}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Input OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {/* Verification Header */}
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-3 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                    <Shield size={24} className="animate-pulse" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Enter Verification Code')}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("We've sent a 6-digit verification code to")}{' '}
                                    <strong className="text-gray-900 dark:text-white font-semibold">{email}</strong>
                                </p>
                            </div>

                            {/* OTP Code Entry */}
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
                                    {t('Verification Code')}
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full text-center py-4 text-3xl font-bold tracking-[0.5em] pl-[0.25em] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono"
                                    placeholder="••••••"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Countdown / Resend Option */}
                            <div className="text-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{t("Didn't receive the email?")}{' '}</span>
                                {resendTimer > 0 ? (
                                    <span className="text-gray-400 dark:text-gray-500 font-medium">
                                        {t('Resend in')}{' '}{resendTimer}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-primary-600 hover:text-primary-700 font-semibold focus:outline-none transition-colors"
                                    >
                                        {t('Resend code')}
                                    </button>
                                )}
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

                            {/* OTP Form Actions */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t('Verifying...')}
                                        </>
                                    ) : (
                                        <>
                                            {t('Verify Code')}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        setError('');
                                        setSuccess('');
                                    }}
                                    className="w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors focus:outline-none"
                                >
                                    ← {t('Back to edit details')}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('New Password')}
                                </label>
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

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-2">
                                            <div className={`h-1 flex-1 rounded-full ${passwordValidation.isValidLength ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`} />
                                            <div className={`h-1 flex-1 rounded-full ${(passwordValidation.hasUpperCase || passwordValidation.hasLowerCase) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`} />
                                            <div className={`h-1 flex-1 rounded-full ${passwordValidation.hasNumbers ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t('Password must be at least 8 characters with letters and numbers')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('Confirm New Password')}
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">{t('Passwords do not match')}</p>
                                )}
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

                            {/* Reset Action */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t('Resetting...')}
                                    </>
                                ) : (
                                    <>
                                        {t('Reset Password')}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Back to Sign In Link */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                        ← {t('Back to Sign In')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
