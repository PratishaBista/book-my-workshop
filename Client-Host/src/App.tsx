import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import HostDashboard from './pages/host/HostDashboard'
import { WorkshopCreationPage } from './pages/host/WorkshopCreationPage';
import { HostOnboardingPage } from './pages/host/HostOnboardingPage';
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/host/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Guest Only Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Host Routes - Only Providers */}
          <Route element={<ProtectedRoute allowedRoles={['User', 'Provider']} />}>
            <Route path="/host-workshop" element={<HostOnboardingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Provider']} />}>
            <Route path="/dashboard" element={<HostDashboard />} />
            <Route path="/host/workshop/create" element={<WorkshopCreationPage />} />
            <Route path="/host/workshop/edit/:id" element={<WorkshopCreationPage />} />

            {/* Legacy/Shorthand Redirects */}
            <Route path="/workshop/create" element={<Navigate to="/host/workshop/create" replace />} />
            <Route path="/workshop/edit/:id" element={<Navigate to="/host/workshop/edit/:id" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App