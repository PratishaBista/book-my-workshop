import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[]; // Property must be a string, if provided otherwise it's optional
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check for onboarding status for regular Users
    if (user && user.role === 'User' && !user.hasCompletedOnboarding && window.location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard or home based on role
        if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'Provider') return <Navigate to="/host/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
