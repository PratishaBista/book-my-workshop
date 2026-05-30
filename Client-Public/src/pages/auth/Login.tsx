import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS, GOOGLE_CLIENT_ID } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

type TabType = 'login' | 'signup';

interface ValidationErrors {
  email?: string;
  password?: string;
  fullName?: string;
  confirmPassword?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get('redirect') || location.state?.from?.pathname || '/';
  const [activeTab, setActiveTab] = useState<TabType>((queryParams.get('tab') as TabType) || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [email, setEmail] = useState(queryParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const tabParam = params.get('tab');
    if (emailParam) {
      setEmail(emailParam);
    }
    if (tabParam === 'signup' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Handle Google Login Callback
  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setApiError('');

    try {
      const res = await fetch(API_ENDPOINTS.auth.googleLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Store token via context to update state
      login(data.token, data.expiry, data.hasCompletedOnboarding);

      if (data.isReactivated) {
        setSuccessMessage('Welcome back! Your account has been reactivated and your data is safe.');
      } else {
        setSuccessMessage('Google login successful!');
      }

      setTimeout(() => {
        sessionStorage.setItem('introShown', 'true');
        if (!data.hasCompletedOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (error: any) {
      setApiError(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  // Separate initialization from rendering
  React.useEffect(() => {
    const initGoogle = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          use_fedcm_for_prompt: true,
          auto_select: false,
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  React.useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const tryRender = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        const parentId = activeTab === 'login' ? 'google-button-login' : 'google-button-signup';
        const parent = document.getElementById(parentId);

        if (parent) {
          window.google.accounts.id.renderButton(parent, {
            theme: 'outline',
            size: 'large',
            width: 350,
            text: 'continue_with',
            shape: 'rectangular',
          });
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryRender, 100);
        }
      }
    };

    const timeout = setTimeout(tryRender, 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

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

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMessage = 'Login failed';

        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        }

        const lowerMsg = errorMessage.toLowerCase();
        if (lowerMsg.includes("email not confirmed") || (response.status === 401 && lowerMsg.includes("email"))) {
          throw new Error("Please verify your email address before logging in. Check your inbox.");
        }

        throw new Error(errorMessage);
      }

      // Update AuthContext
      login(data.token, data.expiry, data.hasCompletedOnboarding);
      localStorage.setItem('isApproved', data.isApproved);

      // Decode token to check role and only allow Customer logins
      try {
        const parts = data.token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;

          const isAdmin = Array.isArray(role) ? role.includes('Admin') : role === 'Admin';
          const isProvider = Array.isArray(role) ? role.includes('Provider') : role === 'Provider';

          if (isProvider) {
            setTimeout(() => {
              window.location.href = 'http://localhost:5174/login';
            }, 1000);
            return;
          } else if (isAdmin) {
            logout();
            setSuccessMessage('');
            setApiError('Admin accounts must log in at: http://localhost:5175');
            setLoading(false);
            return;
          } else {
            if (data.isReactivated) {
              setSuccessMessage('Welcome back! Your account has been reactivated.');
            } else {
              setSuccessMessage('Login successful!');
            }
            sessionStorage.setItem('introShown', 'true');

            if (!data.hasCompletedOnboarding) {
              setTimeout(() => navigate('/onboarding', { replace: true }), 500);
            } else {
              setTimeout(() => navigate(from, { replace: true }), 500);
            }
          }
        } else {
          setSuccessMessage('Login successful!');
          sessionStorage.setItem('introShown', 'true');

          if (!data.hasCompletedOnboarding) {
            setTimeout(() => navigate('/onboarding', { replace: true }), 500);
          } else {
            setTimeout(() => navigate(from, { replace: true }), 500);
          }
        }
      } catch (e) {
        console.error("Token decode error:", e);
        setTimeout(() => navigate('/'), 500);
      }

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
      // Register
      const signupResponse = await fetch(API_ENDPOINTS.auth.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, confirmPassword })
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.message || signupData || 'Signup failed');
      }


      // Success - Email sent with verification link
      setSuccessMessage('Account created! Please check your email to verify your account.');

      // Switch to login tab after 3 seconds
      setTimeout(() => {
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setSuccessMessage('');
      }, 3000);

    } catch (error: any) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#2D1B3E] relative flex items-center justify-center px-4 py-32 overflow-hidden">
        {/* Abstract pattern background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M20 20l15-5-5 15zM70 40l20-10-10 20zM120 20l15-5-5 15zM40 80l20-10-10 20zM100 80l20-10-10 20zM20 140l15-5-5 15zM70 140l20-10-10 20zM120 140l15-5-5 15zM20 80h5v5h-5zM120 80h5v5h-5zM70 90h5v5h-5zM10 50l10-5-5 10zM110 50l10-5-5 10zM50 110l10-5-5 10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[360px] relative z-10"
        >
          <div className="bg-cream-offwhite rounded-[24px] shadow-2xl border border-white/10 overflow-hidden">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="pt-7 px-7 pb-2"
              >
                <h1 className="text-[28px] font-serif font-bold text-deep-purple">
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
              </motion.div>
            </AnimatePresence>

            <div className="px-7 pb-7">

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-xs"
                >
                  <CheckCircle size={16} />
                  {successMessage}
                </motion.div>
              )}

              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs"
                >
                  <XCircle size={16} />
                  {apiError}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'login' ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'login' ? 30 : -30 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-3">

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.email ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                            }}
                            className={`w-full pl-9 pr-10 py-2 text-sm rounded-lg border ${errors.password ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>

                      <div className="flex items-center justify-between text-[13px] mt-1 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="rounded border-deep-purple/20" />
                          <span className="text-deep-purple/70">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-primary-orange hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-2 bg-primary-orange text-white font-semibold rounded-lg hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-deep-purple/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-cream-offwhite text-gray-500">or</span>
                        </div>
                      </div>

                      <div className="flex justify-center w-full min-h-[44px] my-3">
                        <div id="google-button-login"></div>
                      </div>

                      <div className="mt-4 text-center text-[13px] text-deep-purple/70">
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

                  {activeTab === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-3">

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                            }}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.fullName ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="Your full name"
                          />
                        </div>
                        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.email ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              checkPasswordStrength(e.target.value);
                              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                            }}
                            className={`w-full pl-9 pr-10 py-2 text-sm rounded-lg border ${errors.password ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

                        {password && (
                          <div className="mt-1 space-y-0.5 text-[10px]">
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

                      <div>
                        <label className="block text-sm font-semibold text-deep-purple mb-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                            }}
                            className={`w-full pl-9 pr-10 py-2 text-sm rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-deep-purple/20'
                              } bg-transparent focus:outline-none focus:border-primary-orange transition-colors`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer text-xs mt-1">
                        <input type="checkbox" required className="mt-1 rounded border-deep-purple/20" />
                        <span className="text-deep-purple/70 leading-relaxed">
                          I agree to the <Link to="/terms" className="text-primary-orange hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-orange hover:underline">Privacy Policy</Link>
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-2 bg-primary-orange text-white font-semibold rounded-lg hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? 'Creating...' : 'Create Account'}
                      </button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-deep-purple/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-3 bg-cream-offwhite text-gray-500">or</span>
                        </div>
                      </div>

                      <div className="flex justify-center w-full min-h-[44px] my-3">
                        <div id="google-button-signup"></div>
                      </div>

                      <div className="mt-4 text-center text-[13px] text-deep-purple/70">
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

      <Footer />
    </>
  );
};

export default Login;