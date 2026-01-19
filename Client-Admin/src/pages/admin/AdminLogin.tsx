import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.admin.login, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Update AuthContext
                login(data.token, data.expiration);

                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

                if (roles && (roles.includes('Admin') || roles === 'Admin')) {
                    navigate('/dashboard');
                } else {
                    // Reject non-Admin accounts
                    logout();
                    const isProvider = roles && (roles.includes('Provider') || roles === 'Provider');
                    if (isProvider) {
                        setError('Host accounts must log in at: http://localhost:5174');
                    } else {
                        setError('Customer accounts must log in at: http://localhost:5173');
                    }
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-background" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="admin-login-content"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="admin-logo-container"
                >
                    <img
                        src="/Badge.svg"
                        alt="BookMyWorkshop"
                        className="admin-logo"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="admin-login-card"
                >
                    <div className="admin-login-header">
                        <h1 className="admin-login-title">Admin Portal</h1>
                        <p className="admin-login-subtitle">Sign in to continue</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="admin-error-message"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9H7v5h2V5zm0 6H7v2h2v-2z" fill="currentColor" />
                            </svg>
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        <div className="admin-input-group">
                            <label htmlFor="email" className="admin-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="admin-input"
                                placeholder="admin@bookmyworkshop.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="admin-input-group">
                            <label htmlFor="password" className="admin-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="admin-input"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="admin-forgot-password">
                            <a href="#" className="admin-link">
                                Forgot password?
                            </a>
                        </div>

                        <motion.button
                            type="submit"
                            className="admin-login-button"
                            disabled={isLoading}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <span className="admin-loading">
                                    <svg className="admin-spinner" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                                            <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1s" repeatCount="indefinite" />
                                        </circle>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    <div className="admin-login-footer">
                        <p className="admin-footer-text">
                            © 2025 BookMyWorkshop. Administrative Access Only.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
