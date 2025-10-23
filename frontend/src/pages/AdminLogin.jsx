import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InputField, PasswordField } from "../components/InputFields.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/admin/login", form);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminInfo", JSON.stringify(res.data.user));
      navigate("/admin"); // Redirect to Admin Dashboard
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.error || "Failed to login admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border-y-4 border-red-500 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
          Admin Login
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <InputField
            name="email"
            type="email"
            placeholder="Enter your admin email"
            value={form.email}
            onChange={onChange}
          />

          <PasswordField
            name="password"
            placeholder="Enter admin password"
            value={form.password}
            onChange={onChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] transition"
          >
            {loading ? "Signing in..." : "Login as Admin"}
          </button>

          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}
        </form>
        <p
          onClick={() => navigate("/forgot-password")}
          className="text-right mt-2 text-red-600 font-medium hover:underline cursor-pointer"
        >
          Forgot password?
        </p>
        <p className="text-center mt-2 text-gray-600">
          Don’t have an Admin account?{" "}
          <span
            className="text-red-600 cursor-pointer hover:underline font-semibold"
            onClick={() => navigate("/register-admin")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
