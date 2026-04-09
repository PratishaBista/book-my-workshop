export const API_BASE_URL = 'https://localhost:7166/api';

export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/Auth/login`,
    },
    journal: {
        admin: `${API_BASE_URL}/Journal/admin`,
        adminById: (id: number) => `${API_BASE_URL}/Journal/admin/${id}`,
        public: `${API_BASE_URL}/Journal`,
    }
};
