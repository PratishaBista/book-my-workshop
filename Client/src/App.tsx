import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/home/LandingPage'
import WorkshopDetail from './pages/home/WorkshopDetail'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import HostWorkshopPage from './pages/host/HostWorkshopPage'
import HostDashboard from './pages/host/HostDashboard'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile';
import ProfileQR from './pages/profile/ProfileQR';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import { WorkshopCreationPage } from './pages/host/WorkshopCreationPage';
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/workshop/:id" element={<WorkshopDetail />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/host-workshop" element={<HostWorkshopPage />} />

          {/* Guest Only Routes - Logged in users are redirected to home */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private Routes - General (Profile, Settings) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/u/:username/qr" element={<ProfileQR />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
          </Route>

          {/* Host Routes - Only Providers */}
          <Route element={<ProtectedRoute allowedRoles={['Provider']} />}>
            <Route path="/host/dashboard" element={<HostDashboard />} />
            <Route path="/host/workshop/create" element={<WorkshopCreationPage />} />
            <Route path="/host/workshop/edit/:id" element={<WorkshopCreationPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/pxvywv" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App