// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Import page components
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CVBuilder from './pages/CVBuilder';
import Goals from './pages/Goals';
import Progress from './pages/Progress';
import JobSearch from './pages/JobSearch';
import Interview from './pages/Interview';
import CareerPaths from './pages/CareerPaths';
import ResourceHub from './pages/ResourceHub';
import Community from './pages/Community';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Import new footer pages
import About from './pages/about';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Privacy from './pages/Privacy';
import Security from './pages/Security';

import { Compass, Loader } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Compass size={28} className="text-white" />
          </div>
          <Loader className="animate-spin text-primary-600 mx-auto" size={24} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Component with Routes
const AppRoutes = () => {
  const { profile, user, unreadCount } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/security" element={<Security />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/cv" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <CVBuilder />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/goals" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Goals />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/progress" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Progress />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/jobs" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <JobSearch />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/interview" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Interview />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/paths" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <CareerPaths />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/resources" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <ResourceHub />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/community" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Community />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Notifications />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout profile={profile} user={user} unreadCount={unreadCount}>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;