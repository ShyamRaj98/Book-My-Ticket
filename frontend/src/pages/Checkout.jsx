import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../api/axios.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE || "");

function CheckoutForm({ booking }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function createIntent() {
      try {
        const res = await api.post("/payments/create-intent", {
          bookingId: booking._id,
        });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Failed to create payment intent", err);
        setErrorMsg(
          err.response?.data?.error || "Payment initialization failed"
        );
      }
    }
    if (booking) createIntent();
  }, [booking]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!stripe || !elements) {
      setErrorMsg("Stripe not initialized");
      setLoading(false);
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMsg("Card input not found");
      setLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: booking.userName || booking.user?.name || "Guest",
            email:
              booking.userEmail || booking.user?.email || "guest@example.com",
          },
        },
      });

      if (result.error) {
        setErrorMsg(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        navigate(`/booking-success/${booking._id}`);
      } else {
        setErrorMsg("Payment processing...");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <form
        onSubmit={handlePayment}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Checkout
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Complete your payment to confirm your booking
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Movie</span>
            <span className="font-semibold text-gray-900">
              {booking.showtime?.movie?.title || "—"}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Seats</span>
            <span className="font-mono text-gray-900">
              {booking.seats?.map((s) => s.label || s.seatId).join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="text-lg font-bold text-blue-700">
              ₹{booking.amount}
            </span>
          </div>
        </div>

        <label className="block text-sm text-gray-600 mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-md p-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0aec0" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>

        {errorMsg && (
          <div className="text-red-500 text-sm mt-3 bg-red-50 border border-red-200 rounded-md p-2 text-center">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-lg text-white font-semibold shadow transition-all ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Payments are secure and encrypted via Stripe.
        </p>
      </form>
    </div>
  );
}

export default function CheckoutPageWrapper() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error("Failed to load booking", err);
        navigate("/"); // redirect if booking not found
      }
    }
    if (bookingId) loadBooking();
  }, [bookingId]);

  if (!booking)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading booking...
      </div>
    );

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE)
    return <div className="p-6 text-red-600">Stripe key missing</div>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm booking={booking} />
    </Elements>
  );
}
