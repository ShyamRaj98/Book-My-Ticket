import React, { useEffect } from "react";
import { fetchProfile, logout } from "../features/auth/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) dispatch(fetchProfile());
  }, [auth.user, dispatch]);

  if (!auth.user)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading profile...
      </div>
    );

  const handleLogout = () => {
    dispatch(logout());
  };

  const goToAdminDashboard = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 space-y-4">
        {/* User Avatar & Name */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl text-gray-500">
            {auth.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-gray-800">{auth.user.name}</h2>
          <p className="text-gray-500 text-sm">{auth.user.email}</p>
        </div>

        {/* User Info */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Phone</span>
            <span className="text-gray-600">{auth.user.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Role</span>
            <span className="text-gray-600">{auth.user.role || "user"}</span>
          </div>
        </div>

        {/* Admin Dashboard Button */}
        {auth.user.role === "admin" && (
          <button
            onClick={goToAdminDashboard}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition-all hover:shadow-lg"
          >
            Go to Admin Dashboard
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow transition-all hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
