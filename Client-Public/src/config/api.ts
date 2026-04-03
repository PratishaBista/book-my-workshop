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
        delete: `${API_URL}/api/profile/delete`,
        deactivate: `${API_URL}/api/profile/deactivate`,
        reactivate: `${API_URL}/api/profile/reactivate`,
    },
    provider: {
        profile: `${API_URL}/api/provider/profile`,
        uploadLogo: `${API_URL}/api/provider/upload-logo`,
        uploadBanner: `${API_URL}/api/provider/upload-banner`,
    },
    workshop: {
        base: `${API_URL}/api/workshop`,
        public: `${API_URL}/api/workshops/public`,
        featured: `${API_URL}/api/workshops/public/featured`,
        userRecommendations: `${API_URL}/api/workshops/public/recommendations`,
        search: (query: string, location: string) => 
            `${API_URL}/api/workshops/public/search?q=${encodeURIComponent(query)}${location && location !== 'All Locations' ? `&location=${encodeURIComponent(location)}` : ''}`,
        byProvider: (id: number) => `${API_URL}/api/workshops/public/provider/${id}`,
        related: (id: number) => `${API_URL}/api/workshops/public/${id}/related`,
    },
    media: {
        base: `${API_URL}/api/media`,
    },
    category: `${API_URL}/api/category`,
    payment: {
        initiate: `${API_URL}/api/payment/initiate`,
        verify: `${API_URL}/api/payment/verify`,
    },
    preferences: {
        categories: `${API_URL}/api/preferences/categories`,
        my: `${API_URL}/api/preferences/my`,
        save: `${API_URL}/api/preferences/save`,
    },
    booking: {
        my: `${API_URL}/api/booking/my-bookings`,
        byId: (id: number) => `${API_URL}/api/booking/${id}`,
        byCode: (code: string) => `${API_URL}/api/booking/confirmation/${code}`,
        cancel: (id: number) => `${API_URL}/api/booking/${id}/cancel`,
    },
    newsletter: {
        subscribe: `${API_URL}/api/newsletter/subscribe`,
    }
};

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
