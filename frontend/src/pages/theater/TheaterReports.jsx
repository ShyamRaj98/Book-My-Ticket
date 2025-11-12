import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTheaterSummary,
  fetchTheaterSales,
  fetchTheaterPopularMovies,
  fetchTheaterOccupancy,
} from "../../features/reports/theaterReportSlice.js";
import Loading from "../../components/Loading.jsx";
import Error from "../../components/Error.jsx";

export default function TheaterReports() {
  const dispatch = useDispatch();

  const { summary, sales, popular, occupancy, loading, error } = useSelector(
    (state) => state.theaterReports
  );

  useEffect(() => {
    dispatch(fetchTheaterSummary());
    dispatch(fetchTheaterSales({ type: "daily" })); // pass object, not string
    dispatch(fetchTheaterPopularMovies());
    dispatch(fetchTheaterOccupancy());
  }, [dispatch]);

  if (loading) return <Loading loader="fill" text="Loading..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="p-6 space-y-8 bg-[#f5fffb] min-h-screen">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Theater Reports & Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-teal-50 text-center rounded-xl p-6">
          <p className="text-lg font-semibold text-gray-600">Total Sales</p>
          <p className="text-2xl font-bold text-teal-600">
            ₹{summary?.totalSales?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-teal-50 text-center rounded-xl p-6">
          <p className="text-lg font-semibold text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-teal-600">
            {summary?.totalBookings || 0}
          </p>
        </div>
        <div className="bg-teal-50 text-center rounded-xl p-6">
          <p className="text-lg font-semibold text-gray-600">Avg Occupancy</p>
          <p className="text-2xl font-bold text-teal-600">
            {summary?.avgOccupancy ? summary.avgOccupancy.toFixed(2) : 0}%
          </p>
        </div>
      </div>

      {/* Sales Report */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Sales Report
        </h2>
        {sales?.length > 0 ? (
          <table className="w-full overflow-hidden border border-x-4 border-teal-500 bg-teal-50 rounded-2xl">
            <thead>
              <tr className="bg-teal-100">
                <th className="p-2 border border-teal-500">Date</th>
                <th className="p-2 border border-teal-500">Total Bookings</th>
                <th className="p-2 border border-teal-500">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2 border border-teal-500">
                    {`${s._id.day}-${s._id.month}-${s._id.year}`}
                  </td>
                  <td className="p-2 border border-teal-500">
                    {s.totalBookings}
                  </td>
                  <td className="p-2 border border-teal-500">
                    ₹{s.totalSales}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-teal-600">No sales data</p>
        )}
      </div>

      {/* Popular Movies */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Popular Movies
        </h2>
        {popular?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((m) => (
              <div
                key={m._id}
                className="p-4 border border-teal-500 rounded-lg shadow hover:shadow-md transition"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w200${m.movie.posterPath}`}
                  alt={m.movie.title}
                  className="rounded mb-2 w-full"
                />
                <h3 className="font-semibold text-lg">{m.movie.title}</h3>
                <p className="text-sm text-gray-600">
                  Bookings: {m.bookings} | Revenue: ₹{m.totalRevenue}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-teal-600">No popular movie data</p>
        )}
      </div>

      {/* Occupancy */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Theater Occupancy
        </h2>
        {occupancy?.length > 0 ? (
          <table className="w-full bg-teal-50 border border-x-4 border-teal-500 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-teal-100">
                <th className="p-2 border border-teal-500">Theater Name</th>
                <th className="p-2 border border-teal-500">Seats Booked</th>
                <th className="p-2 border border-teal-500">Total Seats</th>
                <th className="p-2 border border-teal-500">Occupancy %</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.map((t, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2 border border-teal-500">
                    {t.theaterName}
                  </td>
                  <td className="p-2 border border-teal-500">
                    {t.seatsBooked}
                  </td>
                  <td className="p-2 border border-teal-500">{t.totalSeats}</td>
                  <td className="p-2 border border-teal-500">
                    {t.occupancyPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-teal-600">No occupancy data</p>
        )}
      </div>
    </div>
  );
}
