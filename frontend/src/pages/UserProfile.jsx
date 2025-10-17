import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, logout } from "../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { InputField } from "../components/InputFields.jsx";

export default function UserProfile() {
  const { user, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user) dispatch(fetchProfile());
    else setForm({ name: user.name, email: user.email, phone: user.phone || "" });
  }, [user, dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    await dispatch(updateProfile({ name: form.name, phone: form.phone }));
    setEditMode(false); // disable fields again
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user)
    return <p className="text-center text-gray-500 mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="bg-white border-red-500 border-x-4 rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
          My Profile
        </h2>

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
            placeholder="Email address"
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

          <div className="flex flex-col gap-3 justify-between mt-6">
            {editMode ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
               Profile Edit
              </button>
            )}

            <button
              onClick={() => navigate("/my-bookings")}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
            My Bookings History
            </button>

            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
               Admin Dashboard
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
