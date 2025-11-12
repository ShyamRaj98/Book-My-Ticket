import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  logout,
} from "../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { InputField } from "../components/InputFields.jsx";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Edit3,
  LogOut,
  Film,
  LayoutDashboard,
  Theater,
} from "lucide-react";

export default function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    } else {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      await dispatch(
        updateProfile({ name: form.name, phone: form.phone })
      ).unwrap();
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-pulse text-gray-500 text-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-200 transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-red-600 mb-4 sm:mb-0 flex items-center gap-2">
            <User className="w-8 h-8 text-red-600" /> My Dashboard
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition active:scale-95"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Column - Profile Form */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Profile Information
            </h3>

            <div className="space-y-5">
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                type="text"
                disabled={!editMode}
              />

              <InputField
                label="Email"
                name="email"
                value={form.email}
                type="email"
                disabled
              />

              <InputField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                type="text"
                disabled={!editMode}
              />

              <div className="mt-4">
                {editMode ? (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition active:scale-95"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition active:scale-95"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Access Cards */}
          <div className="space-y-6">
            <div className="h-[50px] bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 rounded-2xl p-2 flex flex-row items-center justify-center shadow-inner">
              <User className="w-8 h-8 text-gray-700" />
              <span className="font-semibold text-lg">
                Role: {user.role.toUpperCase()}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <button
                onClick={() => navigate("/my-bookings")}
                className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-md"
              >
                <Film className="w-10 h-10 mb-3" />
                <span className="font-semibold text-lg">My Bookings</span>
              </button>

              {user.role === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  <LayoutDashboard className="w-10 h-10 mb-3" />
                  <span className="font-semibold text-lg">Admin Dashboard</span>
                </button>
              )}

              {user.role === "theater" && (
                <button
                  onClick={() => navigate("/theater")}
                  className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-md"
                >
                  <Theater className="w-10 h-10 mb-3" />
                  <span className="font-semibold text-lg">
                    Theater Dashboard
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
