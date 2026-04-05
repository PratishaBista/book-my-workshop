export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        approveWorkshop: (id: number) => `${API_URL}/api/admin/approve-workshop/${id}`,
        rejectWorkshop: (id: number) => `${API_URL}/api/admin/reject-workshop/${id}`,
    },
    profile: {
        get: `${API_URL}/api/profile`,
        update: `${API_URL}/api/profile`,
        uploadAvatar: `${API_URL}/api/profile/upload-avatar`,
        uploadCover: `${API_URL}/api/profile/upload-cover`,
    },
    provider: {
        profile: `${API_URL}/api/provider/profile`,
        uploadLogo: `${API_URL}/api/provider/upload-logo`,
        uploadBanner: `${API_URL}/api/provider/upload-banner`,
        schedule: `${API_URL}/api/provider/schedule`,
        earnings: `${API_URL}/api/provider/earnings`,
        uploadIdCard: `${API_URL}/api/provider/upload-id-card`,
        uploadPanCard: `${API_URL}/api/provider/upload-pan-card`,
        submitVerification: `${API_URL}/api/provider/submit-verification`,
    },
    workshop: {
        base: `${API_URL}/api/workshop`,
        public: `${API_URL}/api/workshops/public`,
    },
    media: {
        base: `${API_URL}/api/media`,
    },
    category: `${API_URL}/api/category`,
    payment: {
        initiate: `${API_URL}/api/payment/initiate`,
        verify: `${API_URL}/api/payment/verify`,
    },
    venues: `${API_URL}/api/venues`
};

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
