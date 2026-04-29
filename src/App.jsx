import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';
import JobPostingPage from './pages/company/JobPostingPage';
import CandidatesPage from './pages/company/CandidatesPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/company/SettingsPage';
// Student pages
import StudentJobsPage from './pages/student/JobsPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import StudentProfilePage from './pages/student/ProfilePage';
import SavedJobsPage from './pages/student/SavedJobsPage';
import StudentNotificationsPage from './pages/student/NotificationsPage';
import StudentSettingsPage from './pages/student/SettingsPage';
import AIInsightsPage from './pages/student/AIInsightsPage';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { seedDatabaseIfEmpty } from './utils/seedData';
import { Briefcase, BookOpen, Bell } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

// Main App Component
function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      
      <Route element={<Layout />}>
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/company" 
          element={
            <ProtectedRoute allowedRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Company Pages - nested inside Layout */}
        <Route path="/company/jobs" element={<ProtectedRoute allowedRole="company"><JobPostingPage /></ProtectedRoute>} />
        <Route path="/company/candidates" element={<ProtectedRoute allowedRole="company"><CandidatesPage /></ProtectedRoute>} />
        <Route path="/company/settings" element={<ProtectedRoute allowedRole="company"><SettingsPage /></ProtectedRoute>} />
        <Route path="/company/notifications" element={<ProtectedRoute allowedRole="company"><NotificationsPage /></ProtectedRoute>} />
        
        {/* Student Pages - all real, no placeholders */}
        <Route path="/student/jobs" element={<ProtectedRoute allowedRole="student"><StudentJobsPage /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRole="student"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/student/saved-jobs" element={<ProtectedRoute allowedRole="student"><SavedJobsPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfilePage /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRole="student"><StudentNotificationsPage /></ProtectedRoute>} />
        <Route path="/student/settings" element={<ProtectedRoute allowedRole="student"><StudentSettingsPage /></ProtectedRoute>} />
        <Route path="/student/ai-insights" element={<ProtectedRoute allowedRole="student"><AIInsightsPage /></ProtectedRoute>} />
        {/* Legacy profile route */}
        <Route path="/profile" element={<ProtectedRoute allowedRole="student"><StudentProfilePage /></ProtectedRoute>} />
        
        {/* Global Protected Routes */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      </Route>

      {/* Landing page for root */}
      <Route 
        path="/" 
        element={<Landing />} 
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
