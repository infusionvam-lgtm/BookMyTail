import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRouter = ({ role: requiredRole }) => {
  const { loggedIn, role } = useSelector((state) => state.auth || {});

  if (!loggedIn) return <Navigate to="/login" replace />;

  // If a specific role is required, check it
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />; // redirect if role mismatch
  }

  return <Outlet />;
};

export default ProtectedRouter;