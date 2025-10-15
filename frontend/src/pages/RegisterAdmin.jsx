import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import {
  InputField,
  PasswordField,
} from "../components/InputFields.jsx"; 

export default function RegisterAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    secretKey: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.secretKey !== "ADMIN123") {
      alert("❌ Invalid secret key!");
      return;
    }

    const result = await dispatch(register({ ...form, role: "admin" }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
        <h2 className="text-3xl font-extrabold text-center text-red-600 mb-6 tracking-wide">
          Admin Registration
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <InputField
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter full name"
            value={form.name}
            onChange={onChange}
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={onChange}
          />

          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={onChange}
          />

          <PasswordField
            label="Password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={onChange}
          />

          <PasswordField
            label="Secret Key (Admin Access)"
            name="secretKey"
            placeholder="Enter admin secret key"
            value={form.secretKey}
            onChange={onChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-red-700 transition disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register Admin"}
          </button>

          {error && (
            <p className="text-center text-red-500 mt-2 font-medium">{error}</p>
          )}
        </form>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <span
            className="text-red-600 cursor-pointer hover:underline font-semibold"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
