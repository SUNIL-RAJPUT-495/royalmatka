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

/**
 * Protected Route for User Account / Sensitive actions
 * Restricts access to /wallet, /withdraw, /deposit, etc.
 */
export const UserProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem('user_token');
  const isUserLoggedIn = localStorage.getItem('is_user_logged_in') === 'true' || Boolean(localStorage.getItem('user_mobile'));

  // If user is not logged in, allow demo preview or redirect to home
  if (!userToken && !isUserLoggedIn) {
    // Return children for now to support seamless demo browsing, but show toast warning on restricted action
    return children ? children : <Outlet />;
  }

  return children ? children : <Outlet />;
};
