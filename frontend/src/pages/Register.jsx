import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { InputField, PasswordField } from "../components/InputFields.jsx";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ ...form, role: "user" }));
    if (result.meta.requestStatus === "fulfilled") navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border-red-500 border-y-4 border rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
          Create Your Account
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <InputField
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
          />

          <InputField
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={onChange}
          />

          <InputField
            name="phone"
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={onChange}
          />

          <PasswordField
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Create Password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}
        </form>

        <p className="text-center mt-6 text-gray-600">
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
