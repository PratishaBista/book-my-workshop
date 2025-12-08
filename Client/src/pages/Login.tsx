import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

type TabType = 'login' | 'signup';

interface ValidationErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return undefined;
  };

  const validateFullName = (name: string): string | undefined => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const validateConfirmPassword = (confirm: string, original: string): string | undefined => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== original) return 'Passwords do not match';
    return undefined;
  };

  // Check password strength
  const checkPasswordStrength = (pwd: string) => {
    setPasswordStrength({
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[@$!%*?&#]/.test(pwd)
    });
  };

  // Handle field blur (validation on leave)
  const handleBlur = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, password);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    // Validate
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenExpiry', data.expiry);

      setSuccessMessage('Login successful!');
      setTimeout(() => navigate('/'), 1500);

    } catch (error: any) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup with auto-verification
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = validateFullName(fullName);
    const confirmError = validateConfirmPassword(confirmPassword, password);

    if (emailError || passwordError || nameError || confirmError) {
      setErrors({
        email: emailError,
        password: passwordError,
        fullName: nameError,
        confirmPassword: confirmError
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register
      const signupResponse = await fetch(API_ENDPOINTS.auth.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, confirmPassword })
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.message || signupData || 'Signup failed');
      }

      // Step 2: Auto-verify email (for local development)
      const verifyResponse = await fetch(API_ENDPOINTS.auth.verifyEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: signupData.token })
      });

      if (!verifyResponse.ok) {
        throw new Error('Email verification failed');
      }

      setSuccessMessage('Account created successfully! You can now login.');

      // Switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setSuccessMessage('');
      }, 2000);

    } catch (error: any) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center px-4 py-12">
      {/* Logo Link */}
      <Link to="/" className="absolute top-8 left-8">
        <img src="/Badge.svg" alt="Book My Workshop" className="h-20 w-auto" />
      </Link>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-cream-offwhite rounded-3xl shadow-xl border border-deep-purple/10 overflow-hidden">

          {/* Card Header - Animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 pb-4"
            >
              <h1 className="text-3xl font-serif font-bold text-deep-purple">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-deep-purple/60 mt-2">
                {activeTab === 'login'
                  ? 'Login to continue your creative journey'
                  : 'Join our community of makers and learners'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form Content */}
          <div className="px-8 pb-8">

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"
              >
                <CheckCircle size={18} />
                {successMessage}
              </motion.div>
            )}

            {/* Error Message */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"
              >
                <XCircle size={18} />
                {apiError}
              </motion.div>
            )}

            {/* Animated Form Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 30 : -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => handleBlur('email', email)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => handleBlur('password', password)}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-deep-purple/20" />
                        <span className="text-deep-purple/70">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary-orange hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-deep-purple/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-cream-offwhite text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      className="w-full py-3 border-2 border-deep-purple/20 rounded-lg font-semibold text-deep-purple hover:bg-cream-base transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>

                    {/* Register Link */}
                    <div className="mt-6 text-center text-sm text-deep-purple/70">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setErrors({});
                          setApiError('');
                        }}
                        className="text-primary-orange font-semibold hover:underline"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                )}

                {/* Signup Form */}
                {activeTab === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() => handleBlur('fullName', fullName)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="Your full name"
                        />
                      </div>
                      {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => handleBlur('email', email)}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                          }}
                          onBlur={() => handleBlur('password', password)}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

                      {/* Password Strength */}
                      {password && (
                        <div className="mt-2 space-y-1 text-xs">
                          <div className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                            {passwordStrength.hasMinLength ? '✓' : '○'} At least 8 characters
                          </div>
                          <div className={passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}>
                            {passwordStrength.hasUppercase ? '✓' : '○'} One uppercase letter
                          </div>
                          <div className={passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}>
                            {passwordStrength.hasLowercase ? '✓' : '○'} One lowercase letter
                          </div>
                          <div className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                            {passwordStrength.hasNumber ? '✓' : '○'} One number
                          </div>
                          <div className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>
                            {passwordStrength.hasSpecial ? '✓' : '○'} One special character (@$!%*?&#)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-deep-purple mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-deep-purple/20'
                            } focus:outline-none focus:border-primary-orange transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2 cursor-pointer text-sm">
                      <input type="checkbox" required className="mt-1 rounded border-deep-purple/20" />
                      <span className="text-deep-purple/70">
                        I agree to the <Link to="/terms" className="text-primary-orange hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-orange hover:underline">Privacy Policy</Link>
                      </span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-deep-purple/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-cream-offwhite text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      className="w-full py-3 border-2 border-deep-purple/20 rounded-lg font-semibold text-deep-purple hover:bg-cream-base transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-deep-purple/70">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setErrors({});
                          setApiError('');
                        }}
                        className="text-primary-orange font-semibold hover:underline"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;