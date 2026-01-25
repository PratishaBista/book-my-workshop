import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/home/LandingPage'
import HostWorkshopPage from './pages/home/HostWorkshopPage';
import WorkshopDetail from './pages/home/WorkshopDetail'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import Settings from './pages/settings/Settings'
import Profile from './pages/profile/Profile';
import ProfileQR from './pages/profile/ProfileQR';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
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
          <Route path="/host-workshop" element={<HostWorkshopPage />} />
          <Route path="/workshop/:id" element={<WorkshopDetail />} />
          <Route path="/verify" element={<VerifyEmail />} />

          {/* Guest Only Routes - Logged in users are redirected to home */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private Routes - Only logged in customers can access */}
          <Route element={<ProtectedRoute allowedRoles={['User']} />}>
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/u/:username/qr" element={<ProfileQR />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App