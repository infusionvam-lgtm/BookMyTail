import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRouter = ({ role: requiredRole }) => {
  const { loggedIn, role } = useSelector((state) => state.auth || {});
  console.log("loggedin " , loggedIn)
  console.log("role" , role)

  if (!loggedIn) return <Navigate to="/login" replace />;

  // If a specific role is required, check it
    console.log("outside" , requiredRole)
  if (requiredRole && role !== requiredRole.toLowerCase()) {
    console.log("inside" , requiredRole)
    return <Navigate to="/" replace />; // redirect if role mismatch
  }

  return <Outlet />;
};

export default ProtectedRouter;