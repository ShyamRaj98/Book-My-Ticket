// src/pages/CheckoutPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import api from "../api/axios.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE || "");

/**
 * Helper: small wrapper to render a disabled-looking card
 */
function PaymentCard({ title, subtitle, children, disabled }) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border ${
        disabled ? "opacity-50 pointer-events-none" : "shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

/**
 * CheckoutForm handles all three payment methods:
 *  - Card (Stripe Elements + PaymentIntent)
 *  - Wallet (Apple Pay / Google Pay) via Stripe PaymentRequest
 *  - UPI (backend-generated link/QR) -> backend must confirm
 *  - Amazon Pay (backend) -> backend must integrate Amazon Pay SDK
 */
function CheckoutForm({ booking }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // PaymentIntent client secret (for card)
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // PaymentRequest (Apple/Google) state
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  // UPI state
  const [upiVpa, setUpiVpa] = useState("");
  const [upiProcessing, setUpiProcessing] = useState(false);
  const [upiLink, setUpiLink] = useState(null);
  const [upiQrUrl, setUpiQrUrl] = useState(null);

  // Amazon Pay state
  const [amazonEnabled, setAmazonEnabled] = useState(
    Boolean(import.meta.env.VITE_AMAZON_PAY_ENABLED === "true")
  );
  const [amazonProcessing, setAmazonProcessing] = useState(false);

  // whether server supports UPI/Amazon (we'll request a capabilities endpoint if you want)
  const upiEnabled = Boolean(import.meta.env.VITE_UPI_ENABLED === "true");

  useEffect(() => {
    // create PaymentIntent for card flow
    async function createIntent() {
      try {
        const res = await api.post("/payments/create-intent", {
          bookingId: booking._id,
        });
        setClientSecret(
          res.data.clientSecret || res.data.client_secret || null
        );
      } catch (err) {
        console.error("Failed to create payment intent", err);
        setErrorMsg(
          err.response?.data?.error || "Payment initialization failed"
        );
      }
    }
    createIntent();
  }, [booking]);

  // Setup Stripe PaymentRequest (Apple Pay / Google Pay)
  useEffect(() => {
    if (!stripe || !booking) return;

    const amountInMinor = Math.round((booking.amount || 0) * 100); // paise
    const pr = stripe.paymentRequest({
      country: import.meta.env.VITE_COUNTRY_CODE || "IN", // e.g. 'IN' or 'US'
      currency: (import.meta.env.VITE_CURRENCY || "INR").toLowerCase(),
      total: {
        label: booking.showtime?.movie?.title || "Booking",
        amount: amountInMinor,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      } else {
        setCanMakePayment(false);
      }
    });

    // Handle paymentrequest token -> confirm with server or confirmCardPayment
    pr.on("paymentmethod", async (ev) => {
      // We will create a PaymentIntent server-side or reuse existing clientSecret and confirm.
      // Using confirmCardPayment is simplest: ask server to create a PaymentIntent (clientSecret) with metadata booking
      try {
        // create intent server-side (we already created one earlier). If clientSecret exists, use it.
        let clientSecretToUse = clientSecret;
        if (!clientSecretToUse) {
          const r = await api.post("/payments/create-intent", {
            bookingId: booking._id,
          });
          clientSecretToUse = r.data.clientSecret || r.data.client_secret;
          setClientSecret(clientSecretToUse);
        }

        // confirm payment using the payment method object
        const confirmResult = await stripe.confirmCardPayment(
          clientSecretToUse,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (confirmResult.error) {
          ev.complete("fail");
          console.error("PaymentRequest confirm error", confirmResult.error);
        } else {
          ev.complete("success");
          // If additional actions are required, handle them
          if (
            confirmResult.paymentIntent &&
            confirmResult.paymentIntent.status === "requires_action"
          ) {
            const next = await stripe.confirmCardPayment(clientSecretToUse);
            if (next.error) {
              console.error("Payment requires_action failed", next.error);
            }
          }
          // Navigate to success page
          navigate(`/booking-success/${booking._id}`);
        }
      } catch (err) {
        console.error("paymentmethod handler error", err);
        ev.complete("fail");
      }
    });

    // cleanup
    return () => {
      try {
        pr?.off && pr.off("paymentmethod");
      } catch (e) {}
    };
  }, [stripe, booking, clientSecret, navigate]);

  // Card payment (Elements) flow
  const handleCardPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!stripe || !elements) {
      setErrorMsg("Stripe not initialized");
      setLoading(false);
      return;
    }
    if (!clientSecret) {
      setErrorMsg("Payment initialization not ready");
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
      } else if (result.paymentIntent?.status === "succeeded") {
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

  // UPI flow — call backend to create a UPI order / link / QR
  const handleGenerateUpi = async () => {
    setUpiProcessing(true);
    setUpiLink(null);
    setUpiQrUrl(null);
    setErrorMsg(null);

    try {
      // server endpoint should create order link or QR and return { upiLink, qrUrl, orderId }
      const res = await api.post("/payments/create-upi", {
        bookingId: booking._id,
        vpa: upiVpa || undefined, // optional: if user entered VPA
      });

      if (res.status === 501) {
        // Not implemented placeholder from backend
        setErrorMsg("UPI integration not implemented on server");
      } else {
        setUpiLink(res.data.upiLink || res.data.upi_url || null);
        setUpiQrUrl(res.data.qrUrl || res.data.qr || null);
        // optionally show instructions: user must complete payment in UPI app then click "I have paid"
      }
    } catch (err) {
      console.error("create-upi error", err);
      setErrorMsg(err.response?.data?.error || "Failed to generate UPI link");
    } finally {
      setUpiProcessing(false);
    }
  };

  // Poll/check UPI payment status (simple "I paid" check)
  const handleCheckUpi = async () => {
    try {
      const r = await api.get(`/payments/check-upi-status`, {
        params: { bookingId: booking._id },
      });
      if (r.data?.paid) {
        navigate(`/booking-success/${booking._id}`);
      } else {
        setErrorMsg(
          "Payment not confirmed yet. We'll finalize once provider confirms."
        );
      }
    } catch (err) {
      console.error("check-upi error", err);
      setErrorMsg(err.response?.data?.error || "Failed to check UPI status");
    }
  };

  // Amazon Pay flow — call server to create amazon order and return client workflow
  const handleAmazonPay = async () => {
    setAmazonProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.post("/payments/create-amazon-order", {
        bookingId: booking._id,
      });

      // backend should return e.g. an object { redirectUrl } or parameters for SPA SDK
      if (res.status === 501) {
        setErrorMsg("Amazon Pay not implemented on server");
      } else if (res.data?.redirectUrl) {
        // redirect to Amazon Pay hosted UI
        window.location.href = res.data.redirectUrl;
      } else {
        // handle SDK flow if provided
        setErrorMsg("Amazon Pay integration returned unexpected payload");
      }
    } catch (err) {
      console.error("amazon pay error", err);
      setErrorMsg(err.response?.data?.error || "Amazon Pay error");
    } finally {
      setAmazonProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      {/* Booking summary */}
      <div className="bg-white min-w-[500px] rounded-2xl p-4 border border-gray-300 border-x-4 shadow-2xl mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Movie</span>
          <span className="font-semibold">
            {booking.showtime?.movie?.title || "—"}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Seats</span>
          <span className="font-mono">
            {booking.seats?.map((s) => s.label || s.seatId).join(", ")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="text-xl font-bold">₹{booking.amount}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Select payment method above to complete booking.
        </div>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 border border-gray-300 border-x-4 shadow-2xl rounded-2xl p-6 bg-white">
        {/* Left: Card + Wallet */}
        <div className="space-y-6">
          {/* Card Payment */}
          <PaymentCard
            title="Card Payment"
            subtitle="Pay securely with card (Stripe)"
          >
            <form onSubmit={handleCardPayment}>
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-2">
                  Card Details
                </label>
                <div className="border border-gray-300 rounded-md p-3 bg-white">
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
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm mt-3">{errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : `Pay ₹${booking.amount}`}
              </button>
            </form>
          </PaymentCard>

          {/* Wallet Payment (Apple Pay / Google Pay) */}
          <PaymentCard
            title="Wallets (Apple Pay / Google Pay)"
            subtitle={
              canMakePayment
                ? "Tap to pay with your device wallet"
                : "Wallet not available on this device"
            }
            disabled={!canMakePayment}
          >
            {canMakePayment && paymentRequest ? (
              <div>
                <PaymentRequestButtonElement options={{ paymentRequest }} />
                <div className="text-xs text-gray-500 mt-2">
                  Apple Pay / Google Pay (via Stripe)
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Wallets are not available on this browser or device.
              </div>
            )}
          </PaymentCard>
        </div>

        {/* Right: UPI + Amazon Pay + Summary */}
        <div className="space-y-6">
          {/* UPI Section */}
          <PaymentCard
            title="UPI Payment"
            subtitle={
              upiEnabled
                ? "Generate UPI link or QR to pay"
                : "UPI not enabled on server"
            }
            disabled={!upiEnabled}
          >
            <div className="mb-2 text-sm text-gray-600">
              Enter your UPI ID (optional) to generate a UPI deep link or QR.
            </div>

            <input
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value)}
              placeholder="example@bank"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              disabled={!upiEnabled || upiProcessing}
            />

            <div className="flex gap-2">
              <button
                onClick={handleGenerateUpi}
                disabled={!upiEnabled || upiProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
              >
                {upiProcessing ? "Generating..." : "Generate UPI Link / QR"}
              </button>

              <button
                onClick={handleCheckUpi}
                disabled={!upiEnabled}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Check Payment Status
              </button>
            </div>

            {upiLink && (
              <div className="mt-3">
                <div className="text-sm text-gray-700 mb-2">
                  UPI Link (tap to open):
                </div>
                <a
                  href={upiLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {upiLink}
                </a>
              </div>
            )}

            {upiQrUrl && (
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-700 mb-2">
                  Scan QR to pay:
                </div>
                <img
                  src={upiQrUrl}
                  alt="UPI QR"
                  className="mx-auto w-40 h-40 object-contain"
                />
              </div>
            )}
          </PaymentCard>

          {/* Amazon Pay Section */}
          <PaymentCard
            title="Amazon Pay"
            subtitle={
              amazonEnabled ? "Pay using Amazon Pay" : "Amazon Pay not enabled"
            }
            disabled={!amazonEnabled}
          >
            <div className="mb-3 text-sm text-gray-600">
              Amazon Pay integration requires server-side setup (merchant
              account). If enabled on server you'll be redirected to Amazon Pay.
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAmazonPay}
                disabled={!amazonEnabled || amazonProcessing}
                className={`px-4 py-2 rounded text-white ${
                  amazonProcessing
                    ? "bg-gray-400"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {amazonProcessing ? "Processing..." : "Pay with Amazon Pay"}
              </button>
            </div>
          </PaymentCard>
        </div>
      </div>
    </div>
  );
}

/**
 * Page wrapper: loads booking data, renders Elements
 */
export default function CheckoutPageWrapper() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        // adapt to your API response shape
        setBooking(res.data.booking || res.data);
      } catch (err) {
        console.error("Failed to load booking", err);
        navigate("/");
      }
    }
    if (bookingId) loadBooking();
  }, [bookingId, navigate]);

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
