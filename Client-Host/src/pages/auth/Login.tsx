import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

        if (errorMessage.includes("Email not confirmed")) {
          throw new Error("Please verify your email address before logging in. Check your inbox.");
        }

        throw new Error(errorMessage);
      }

      // Update AuthContext
      login(data.token, data.expiry);
      localStorage.setItem('isApproved', data.isApproved);

      // Decode token to check role - ONLY allow Provider logins
      try {
        const parts = data.token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;

          const isAdmin = Array.isArray(role) ? role.includes('Admin') : role === 'Admin';
          const isProvider = Array.isArray(role) ? role.includes('Provider') : role === 'Provider';

          if (isProvider) {
            // Host login successful
            setSuccessMessage('Login successful!');
            setTimeout(() => navigate(from, { replace: true }), 500);
          } else if (isAdmin) {
            // RESTRICTED: Admins must use the Admin portal
            logout();
            setSuccessMessage('');
            setApiError('Admin accounts must log in at: http://localhost:5175');
            setLoading(false);
            return;
          } else {
            // RESTRICTED: Customers must use the Public portal
            logout();
            setSuccessMessage('');
            setApiError('Customer accounts must log in at: http://localhost:4000');
            setLoading(false);
            return;
          }
        } else {
          throw new Error('Invalid token format');
        }
      } catch (e) {
        console.error("Token decode error:", e);
        logout();
        setApiError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

    } catch (error: any) {
      setApiError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-base flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-cream-offwhite rounded-3xl shadow-xl border border-deep-purple/10 overflow-hidden">

          <div className="p-8 pb-4">
            <h1 className="text-3xl font-serif font-bold text-deep-purple">
              Host Portal
            </h1>
            <p className="text-deep-purple/60 mt-2">
              Login to manage your workshops
            </p>
          </div>

          <div className="px-8 pb-8">

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

            <form onSubmit={handleLogin} className="space-y-4">

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login as Host'}
              </button>

              <div className="mt-6 text-center text-sm text-deep-purple/70">
                New Host?{' '}
                <a
                  href="http://localhost:4000/host-workshop"
                  className="text-primary-orange font-semibold hover:underline"
                >
                  Register Here
                </a>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;