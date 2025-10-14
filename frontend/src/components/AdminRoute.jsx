// client/src/components/AdminRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const auth = useSelector(s => s.auth);
  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.user?.role !== 'admin') return <div className="p-6">Access denied — admin only</div>;
  return children;
}
