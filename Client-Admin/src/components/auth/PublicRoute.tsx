import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute: React.FC = () => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (isAuthenticated && user) {
        if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'Provider') return <Navigate to="/host/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
