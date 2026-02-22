import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SuperLogin from './pages/auth/SuperLogin';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import CommissionPage from './pages/dashboard/CommissionPage';
import PayoutsPage from './pages/dashboard/PayoutsPage';

const isAuthenticated = () => !!localStorage.getItem('superadmin_token');

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<SuperLogin />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Navigate to="/dashboard/overview" replace />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/overview"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <OverviewPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/commission"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <CommissionPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/payouts"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <PayoutsPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
