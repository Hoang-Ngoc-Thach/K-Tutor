import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getHomePath } from "../../context/authContext";
import { useAuth } from "../../context/useAuth";

// Wrap a page element: <ProtectedRoute><Page /></ProtectedRoute>
// Pass role="admin" to also require that role.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}
