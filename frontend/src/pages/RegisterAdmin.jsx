import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { InputField, PasswordField } from "../components/InputFields.jsx";
import { Link, useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    secretKey: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ ...formData, role: "admin" }));
    console.log(result);
    if (result.meta.requestStatus === "fulfilled") navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-red-500 border-y-4 shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Register
        </h2>

        <InputField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <div className="mt-2">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mt-2">
          <InputField
            label="Phone Number"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mt-2">
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="mt-2">
          <InputField
            label="Admin Secret Code"
            name="secretKey"
            value={formData.secretKey}
            onChange={handleChange}
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
          className="w-full mt-2 mb-3 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          {loading ? "Registering..." : "Register as Admin"}
        </button>
        <div className="flex flex-col items-center text-center mt-2 text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-lg hover:underline">
            Already have an account? <span className="text-red-500">Login</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;
