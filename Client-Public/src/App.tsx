import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/home/LandingPage';
import AllWorkshops from './pages/home/AllWorkshops';
import HostWorkshopPage from './pages/home/HostWorkshopPage';
import WorkshopDetail from './pages/home/WorkshopDetail';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Onboarding from './pages/auth/Onboarding';
import VerifyEmail from './pages/auth/VerifyEmail';
import Settings from './pages/settings/Settings';
import Profile from './pages/profile/Profile';
import ProfileQR from './pages/profile/ProfileQR';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import Checkout from './pages/payment/Checkout';
import MyBookings from './pages/profile/MyBookings';
import AboutPage from './pages/identity/AboutPage';
import ContactPage from './pages/identity/ContactPage';
import JournalArticle from './pages/journal/JournalArticle';
import JournalListPage from './pages/journal/JournalListPage';
import NotFoundPage from './pages/error/NotFoundPage';

import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/workshops" element={<AllWorkshops />} />
          <Route path="/host-workshop" element={<HostWorkshopPage />} />
          <Route path="/workshop/:id" element={<WorkshopDetail />} />
          <Route path="/articles" element={<JournalListPage />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/:slug" element={<JournalArticle />} />

          {/* Guest Only Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Private Routes */}
          <Route element={<ProtectedRoute allowedRoles={['User']} />}>
            <Route path="/u/:username" element={<Profile />} />
            <Route path="/profile/bookings" element={<MyBookings />} />
            <Route path="/u/:username/qr" element={<ProfileQR />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;