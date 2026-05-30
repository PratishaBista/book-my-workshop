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
        approveProvider: (id: number) => `${API_URL}/api/admin/approve-provider/${id}`,
        rejectProvider: (id: number) => `${API_URL}/api/admin/reject-provider/${id}`,
        suspendProvider: (id: number) => `${API_URL}/api/admin/suspend-provider/${id}`,
        unsuspendProvider: (id: number) => `${API_URL}/api/admin/unsuspend-provider/${id}`,
        suspendUser: (id: string) => `${API_URL}/api/admin/suspend-user/${id}`,
        unsuspendUser: (id: string) => `${API_URL}/api/admin/unsuspend-user/${id}`,
        reviews: (filter: 'all' | 'flagged' = 'all') =>
            `${API_URL}/api/admin/reviews?filter=${filter}`,
        flaggedReviews: `${API_URL}/api/admin/reviews/flagged`,
        deleteReview: (id: number) => `${API_URL}/api/admin/reviews/${id}`,
        seedSampleReviews: (force = false) =>
            `${API_URL}/api/admin/seed-sample-reviews?force=${force}`,
        remoderateReviews: `${API_URL}/api/admin/reviews/remoderate`,
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
    notifications: {
        base: `${API_URL}/api/notification`,
        read: (id: number) => `${API_URL}/api/notification/${id}/read`,
        readAll: `${API_URL}/api/notification/read-all`,
    },
    hubs: {
        notifications: `${API_URL}/hubs/notifications`
    }
};

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
