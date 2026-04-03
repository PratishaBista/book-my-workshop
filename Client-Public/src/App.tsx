import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/home/LandingPage'
import HostWorkshopPage from './pages/home/HostWorkshopPage';
import WorkshopDetail from './pages/home/WorkshopDetail'
import Login from './pages/auth/Login'
import Onboarding from './pages/auth/Onboarding';
import VerifyEmail from './pages/auth/VerifyEmail'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile';
import ProfileQR from './pages/profile/ProfileQR';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import Checkout from './pages/payment/Checkout';
import MyBookings from './pages/profile/MyBookings';
import MissionPage from './pages/identity/MissionPage';
import ContactPage from './pages/identity/ContactPage';

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
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/host-workshop" element={<HostWorkshopPage />} />
          <Route path="/workshop/:id" element={<WorkshopDetail />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Guest Only Routes - Logged in users are redirected to home */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private Routes - Only logged in customers can access */}
          <Route element={<ProtectedRoute allowedRoles={['User']} />}>
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/profile/bookings" element={<MyBookings />} />
            <Route path="/u/:username/qr" element={<ProfileQR />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App