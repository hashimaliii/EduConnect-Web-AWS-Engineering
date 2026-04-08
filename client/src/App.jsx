import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import TutorSearch from './pages/student/TutorSearch';
import MySessions from './pages/student/MySessions';
import Wishlist from './pages/student/Wishlist';
import Notifications from './pages/student/Notifications';
import TutorProfile from './pages/tutor/Profile';
import TutorDashboard from './pages/tutor/Dashboard';
import TutorSessions from './pages/tutor/Sessions';
import TutorEarnings from './pages/tutor/Earnings';
import TutorVerification from './pages/tutor/Verification';
import AdminDashboard from './pages/admin/Dashboard';
import VerificationReview from './pages/admin/Verification';
import AdminReports from './pages/admin/Reports';
import Users from './pages/admin/Users';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student/dashboard" element={<TutorSearch />} />
        <Route path="/student/sessions" element={<MySessions />} />
        <Route path="/student/wishlist" element={<Wishlist />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/verify" element={<TutorVerification />} />
        <Route path="/tutor/profile" element={<TutorProfile />} />
        <Route path="/tutor/sessions" element={<TutorSessions />} />
        <Route path="/tutor/earnings" element={<TutorEarnings />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verification" element={<VerificationReview />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/users" element={<Users />} />
      </Routes>
    </Router>
  );
}

export default App;
