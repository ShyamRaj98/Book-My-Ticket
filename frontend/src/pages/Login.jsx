import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import {
  InputField,
  PasswordField,
  SelectInput,
} from "../components/InputFields.jsx";

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));

    if (result.payload && result.payload.error) return;

    if (result.meta.requestStatus === "fulfilled") {
      const { role } = formData;
      if (role === "admin") navigate("/admin");
      else if (role === "theater") navigate("/theater");
      else navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-red-500 border-y-4 shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <SelectInput
          label="Login as"
          name="role"
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: val })}
          options={[
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
            { value: "theater", label: "Theater" },
          ]}
        />

        <div className="mt-4">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
        </div>

        <div className="mt-4">
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>

        <div className="h-[30px] mt-2">
          {error && (
            <p className="bg-red-200 my-1 p-1 border-red-500 text-red-500 text-sm font-semibold text-center rounded-lg">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex flex-col text-center mt-2 text-sm text-gray-600">
          <Link
            to="/forgot-password"
            className="text-red-500 font-semibold text-md text-end hover:underline"
          >
            Forgot password?
          </Link>
          <Link to="/register" className="font-semibold hover:underline my-2">
            Don’t have an account?{" "}
            <span className="text-red-500">Register User</span>
          </Link>
          <Link
            to="/register-admin"
            className="font-semibold hover:underline my-2"
          >
            Don’t have an account?{" "}
            <span className="text-red-500">Register Admin</span>
          </Link>
          <Link
            to="/register-theater"
            className="font-semibold hover:underline my-2"
          >
            Don’t have an account?{" "}
            <span className="text-blue-500">Register Theater</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
