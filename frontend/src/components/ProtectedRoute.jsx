// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// 🎟️ Regular user route
export function UserRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// 🛡️ Admin-only route
export function AdminRoute({ children }) {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin")
    return <div className="p-6 text-center text-red-600">Access denied — Admin only</div>;
  return children;
}

// 🎭 Theater admin route
export function TheaterRoute({ children }) {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "theater")
    return <div className="p-6 text-center text-red-600">Access denied — Theater admin only</div>;
   if (!user?.isApproved)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg font-semibold">
        ⏳ Your account is not yet approved. Please wait for admin approval.{user.role}
      </div>
    );
  return children;
}
