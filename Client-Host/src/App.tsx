import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import HostDashboard from './pages/host/HostDashboard'
import { WorkshopCreationPage } from './pages/host/WorkshopCreationPage';
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

          {/* Guest Only Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Host Routes - Only Providers */}
          <Route element={<ProtectedRoute allowedRoles={['Provider']} />}>
            <Route path="/dashboard" element={<HostDashboard />} />
            <Route path="/workshop/create" element={<WorkshopCreationPage />} />
            <Route path="/workshop/edit/:id" element={<WorkshopCreationPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App