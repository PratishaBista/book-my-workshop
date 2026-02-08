import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SuperLogin from './pages/auth/SuperLogin';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<SuperLogin />} />

                <Route
                    path="/dashboard"
                    element={<div className="min-h-screen bg-[#0d0614] flex items-center justify-center text-white font-serif text-3xl">Dashboard Initializing...</div>}
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
