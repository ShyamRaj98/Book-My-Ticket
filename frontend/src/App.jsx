import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchProfile } from "./features/auth/authSlice.js";
import MovieDetail from "./pages/MovieDetail.jsx";
import MovieSearch from "./pages/MovieSearch.jsx";
import MovieDetailWrapperForTmdb from "./pages/MovieDetailWrapperForTmdb.jsx";
import ShowtimeSeats from "./pages/ShowtimeSeats.jsx";
import CheckoutPageWrapper from "./pages/Checkout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import AdminMovies from "./pages/admin/AdminMovies.jsx";
import AdminTheaters from "./pages/admin/AdminTheaters.jsx";
import AdminScreens from "./pages/admin/AdminScreens.jsx";
import AdminShowtimes from "./pages/admin/AdminShowtimes.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminScreenEditor from "./pages/admin/AdminScreenEditor.jsx";
import AdminSeat from "./pages/admin/AdminSeat.jsx";
import Home from "./pages/Home.jsx";
import Header from "./components/Header.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Footer from "./components/Footer.jsx";
import RegisterAdmin from "./pages/RegisterAdmin.jsx";
import MyBooking from "./pages/MyBooking.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

function AppContent() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const location = useLocation();

  // Fetch user profile if token exists
  useEffect(() => {
    if (auth.token && !auth.user) {
      dispatch(fetchProfile());
    }
  }, [auth.token, auth.user, dispatch]);

  // Check if current route is admin
  const isAdminRoute = ["/admin", "/register-admin", "/login", "/register"].find((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieSearch />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route
            path="/movies/tmdb/:tmdbId"
            element={<MovieDetailWrapperForTmdb />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/showtimes/:id"
            element={
              <ProtectedRoute>
                <ShowtimeSeats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPageWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-success/:bookingId"
            element={<BookingSuccess />}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="movies" element={<AdminMovies />} />
            <Route path="theaters" element={<AdminTheaters />} />
            <Route path="seatlayout" element={<AdminSeat />} />
            <Route path="screens" element={<AdminScreens />} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="screen-edit" element={<AdminScreenEditor />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="all-users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>

      {/* Footer should not appear on admin pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
