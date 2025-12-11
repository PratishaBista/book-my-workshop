// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
    auth: {
        signup: `${API_URL}/api/auth/signup`,
        login: `${API_URL}/api/auth/login`,
        verifyEmail: `${API_URL}/api/auth/verify-email`,
        googleLogin: `${API_URL}/api/auth/google`,
        forgotPassword: `${API_URL}/api/auth/forgot-password`,
        resetPassword: `${API_URL}/api/auth/reset-password`,
        providerSignup: `${API_URL}/api/auth/provider/signup`,
    },
    admin: {
        login: `${API_URL}/api/auth/login`,
        workshops: `${API_URL}/api/admin/workshops`,
        categories: `${API_URL}/api/category`,
        users: `${API_URL}/api/admin/users`,
        providers: `${API_URL}/api/admin/providers`,
    },

};

// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
