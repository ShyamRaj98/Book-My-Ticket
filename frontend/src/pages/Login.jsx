import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { InputField, PasswordField } from "../components/InputFields.jsx";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border-red-500 border-y-4 border rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">
          Welcome Back
        </h2>
        <form onSubmit={onSubmit} className="space-y-5">
          <InputField
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={onChange}
          />

          <PasswordField
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-[0.98] transition"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-red-600 cursor-pointer hover:underline font-semibold"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
