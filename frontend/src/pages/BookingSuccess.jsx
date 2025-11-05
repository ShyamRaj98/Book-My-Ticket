import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import QRCode from "react-qr-code";
import Loading from "../components/Loading.jsx";

// =================== PDF Styles ===================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#fffbe6",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222",
  },
  section: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: { fontWeight: "bold", marginRight: 5 },
  qrCode: { marginTop: 20, alignSelf: "center", width: 100, height: 100 },
  footer: { fontSize: 10, textAlign: "center", marginTop: 20, color: "#555" },
});

// =================== PDF Ticket Document ===================
const TicketDocument = ({ booking }) => {
  const seatsList = booking.seats.map((s) => s.seatId || s.label).join(", ");
  const qrValue = `Booking:${booking._id}|Movie:${booking.showtime.movie.title}|Seats:${seatsList}`;

  return (
    <Document>
      <Page size="A5" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>🎬 BookMyTicket</Text>

        <View style={pdfStyles.section}>
          <Text>
            <Text style={pdfStyles.label}>Booking ID:</Text> {booking._id}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Movie:</Text>{" "}
            {booking.showtime.movie.title}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Theater:</Text>{" "}
            {booking.showtime.theater.name}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Screen:</Text>{" "}
            {booking.showtime.screenName || "Screen 1"}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Showtime:</Text>{" "}
            {new Date(booking.showtime.startTime).toLocaleString()}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Seats:</Text> {seatsList}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Amount Paid:</Text> ₹
            {booking.amount?.toFixed(2)}
          </Text>
          <Text>
            <Text style={pdfStyles.label}>Payment Status:</Text>{" "}
            {booking.status}
          </Text>
        </View>

        <View style={pdfStyles.qrCode}>
          <QRCode value={qrValue} size={100} />
        </View>

        <Text style={pdfStyles.footer}>
          Please arrive 15 mins early. Show this ticket or QR code at entry.
        </Text>
      </Page>
    </Document>
  );
};

// =================== Booking Success Component ===================
export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Poll backend until payment confirmed
  useEffect(() => {
    let interval;

    async function fetchBooking() {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        const data = res.data.booking;
        setBooking(data);
        setLoading(false);

        // ✅ Stop polling when payment confirmed
        if (data.status === "paid" && interval) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Booking fetch failed:", err);
        setLoading(false);
        navigate("/");
      }
    }

    if (bookingId) {
      fetchBooking();
      interval = setInterval(fetchBooking, 5000);
    }

    return () => clearInterval(interval);
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <Loading loader="load" text="Loading booking details..."/>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Booking not found.
      </div>
    );
  }

  const statusColor =
    booking.status === "paid" ? "text-green-700" : "text-yellow-600";

  // =================== UI ===================
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10 px-4">
      {/* Ticket Card */}
      <div className="bg-gradient-to-r from-red-100 via-red-50 to-red-100 shadow-2xl rounded-2xl w-full max-w-md p-6 relative border-t-4 border-red-400">
        <h1 className="text-3xl font-bold text-red-800 mb-2 text-center">
          🎬 BookMyTicket
        </h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          Booking ID: <span className="font-mono">{booking._id}</span>
        </p>

        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {booking.showtime.movie.title}
          </h2>
          <p className="text-gray-700">
            {booking.showtime.theater.name} —{" "}
            {booking.showtime.screenName || "Screen 1"}
          </p>
          <p className="text-gray-700">
            {new Date(booking.showtime.startTime).toLocaleString()}
          </p>
        </div>

        <div className="border-t border-b py-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2 text-center">
            Seats:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {booking.seats.map((seat, idx) => (
              <span
                key={idx}
                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {seat.seatId || seat.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 mb-4">
          <p className="text-gray-800 font-semibold">
            Amount Paid: ₹{booking.amount?.toFixed(2)}
          </p>
          <p className={`font-semibold ${statusColor}`}>
            Status: {booking.status.toUpperCase()}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mt-4">
          <QRCode
            value={`Booking:${booking._id}|Movie:${
              booking.showtime.movie.title
            }|Seats:${booking.seats.map((s) => s.seatId || s.label).join(",")}`}
            size={120}
            className="bg-white p-2 rounded-md shadow"
          />
        </div>

        {/* PDF Download */}
        <div className="mt-6 text-center">
          <PDFDownloadLink
            document={<TicketDocument booking={booking} />}
            fileName={`BookMyTicket_${booking._id}.pdf`}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-semibold transition cursor-pointer"
          >
            {({ loading }) =>
              loading ? "Generating PDF..." : "Download Ticket (PDF)"
            }
          </PDFDownloadLink>
        </div>
      </div>

      <Link to="/" className="mt-6 text-red-800 hover:underline font-medium">
        ← Back to Home
      </Link>
    </div>
  );
}
