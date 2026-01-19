import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    name: string;
    email: string;
    role: string;
    id?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, expiry: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const parts = token.split('.');
                    if (parts.length >= 2) {
                        const payload = JSON.parse(atob(parts[1]));
                        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User';
                        const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name;
                        const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email;

                        // Handle array roles (e.g. if user matches multiple policies, though rare in this simple app)
                        const finalRole = Array.isArray(role) ? role[0] : role;

                        setUser({
                            name,
                            email,
                            role: finalRole
                        });
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (e) {
                    console.error("Failed to decode token", e);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, expiry: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', expiry);

        // Immediate decode to update state
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'User';
            const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name;
            const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email;

            setUser({
                name,
                email,
                role: Array.isArray(role) ? role[0] : role
            });
        } catch (e) {
            console.error(e);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
