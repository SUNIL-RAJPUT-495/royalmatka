import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Protected Route for Admin Panel
 * Restricts access to /systum/* routes unless logged in with royal_user_admin
 */
export const AdminProtectedRoute = () => {
  const adminToken = localStorage.getItem('royal_user_admin') || localStorage.getItem('admin_token');
  const isAdminLoggedIn = localStorage.getItem('is_admin_logged_in') === 'true';

  // Persist session if token exists in localStorage
  if (adminToken && !isAdminLoggedIn) {
    localStorage.setItem('is_admin_logged_in', 'true');
  }

  const isAuth = Boolean(adminToken || isAdminLoggedIn);

  if (!isAuth) {
    return <Navigate to="/systum/login" replace />;
  }

  return <Outlet />;
};

/**
 * Protected Route for User App
 * Restricts access unless logged in with valid royal_matka_user token
 */
export const UserProtectedRoute = ({ children }) => {
  const userToken = localStorage.getItem('royal_matka_user') || localStorage.getItem('user_token') || localStorage.getItem('access_token');
  const isUserLoggedIn = Boolean(userToken);

  if (!isUserLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};
