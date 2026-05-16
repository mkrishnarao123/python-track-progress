import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import UserManagement from './components/UserManagement/UserManagement';
import Checklist from './components/Checklist/Checklist';
import PracticeCode from './components/PracticeCode/PracticeCode';
import InterviewQA from './components/InterviewQA/InterviewQA';
import GlobalLoading from './components/GlobalLoading/GlobalLoading';
import { getAuthToken, getAuthUser, clearAuthData } from './utils/authUtils';

function DashboardLayout({ user, onLogout }) {
  return (
    <div className="app-shell">
      <div className="app-header">
        <Header user={user} onLogout={onLogout} />
      </div>
      <div className="app-body">
        <div className="app-sidebar">
          <Sidebar />
        </div>
        <div className="app-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [user, setUser] = useState(() => getAuthUser());
  const hasToken = Boolean(getAuthToken());
  const canAccessProtectedRoutes = isAuthenticated && hasToken;

  const handleLoginSuccess = (nextUser) => {
    setUser(nextUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear all auth data and sessionStorage
    clearAuthData();

    // Reset redux slices to initial state
    try {
      const { resetPythonLearnState } = require('./store/pythonLearnSlice');
      const { resetLoadingState } = require('./store/loadingSlice');
      dispatch(resetPythonLearnState());
      dispatch(resetLoadingState());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to reset redux state on logout', err);
    }

    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.24 }}
      >
        <GlobalLoading />
        <Routes location={location}>
          <Route
            path="/login"
            element={canAccessProtectedRoutes ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/signup"
            element={canAccessProtectedRoutes ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/"
            element={
              canAccessProtectedRoutes ? (
                <DashboardLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="user-management" element={<UserManagement user={user} />} />
            <Route path="checklist" element={<Checklist user={user} />} />
            <Route path="practiceCode" element={<PracticeCode user={user} />} />
            <Route path="interview-qa" element={<InterviewQA user={user} />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
