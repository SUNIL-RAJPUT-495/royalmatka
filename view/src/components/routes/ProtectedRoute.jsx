import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Protected Route for Admin Panel
 * Restricts access to /systum/* routes unless logged in as Admin
 */
export const AdminProtectedRoute = () => {
  const adminToken = localStorage.getItem('admin_token');
  const isAdminLoggedIn = localStorage.getItem('is_admin_logged_in') === 'true';

  if (!adminToken && !isAdminLoggedIn) {
    toast.error('Access Denied. Please login to access Admin Panel.');
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user_data');
  const userToken = localStorage.getItem('user_token');
  const isUserLoggedIn = Boolean(token || userData || userToken);

  if (!isUserLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};
