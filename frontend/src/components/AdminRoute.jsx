import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Loader } from 'lucide-react';
import AdminLayout from './AdminLayout';

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  
  // Profile is still loading if the user is signed in but the profile fields are not yet fetched
  const isProfileLoading = user && !profile?.email;

  if (loading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Compass size={28} className="text-white animate-spin" />
          </div>
          <Loader className="animate-spin text-primary-600 mx-auto" size={24} />
        </div>
      </div>
    );
  }

  const isAdmin = user && profile?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;
