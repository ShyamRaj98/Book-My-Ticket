import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PasswordSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border-y-4 border-green-500 rounded-2xl shadow-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-green-600 mb-3">
          Password Changed Successfully!
        </h2>
        <p className="text-gray-600 mb-4">
          You’ll be redirected to the login page in{" "}
          <span className="font-semibold">{countdown}</span> seconds.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="py-2 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
}
