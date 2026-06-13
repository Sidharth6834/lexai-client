import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    // Redirect to login page and store source URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!user || user.role !== 'admin')) {
    // Redirect non-admin users to their standard dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
