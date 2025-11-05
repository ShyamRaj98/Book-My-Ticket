import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSummary,
  fetchSales,
  fetchPopularMovies,
  fetchOccupancy,
  fetchUserActivity,
} from "../../features/reports/reportSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const AdminReport = () => {
  const dispatch = useDispatch();
  const { summary, sales, popular, occupancy, users, loading } = useSelector((s) => s.reports);
  const [interval, setInterval] = useState("daily");

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchSales({ interval }));
    dispatch(fetchPopularMovies());
    dispatch(fetchOccupancy());
    dispatch(fetchUserActivity());
  }, [dispatch, interval]);

  const formatDate = (id) =>
    id.day ? `${id.day}/${id.month}` : id.week ? `W${id.week}/${id.year}` : `${id.month}/${id.year}`;

  const salesLabels = sales.map((r) => formatDate(r._id));
  const salesData = sales.map((r) => r.totalSales);
  const popularLabels = popular.map((p) => p.movie?.title || "Unknown");
  const popularCounts = popular.map((p) => p.bookings);
  const occupancyLabels = occupancy.map((t) => t.theaterName);
  const occupancyVals = occupancy.map((t) => t.occupancyPct);
  const userLabels = users.map((u) => u.user?.name || u.user?.email);
  const userSpent = users.map((u) => u.totalSpent);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#b91c1c", font: { size: 13, weight: 600 } },
      },
      tooltip: {
        backgroundColor: "#b91c1c",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: { color: "#7f1d1d", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: { color: "#7f1d1d", font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-red-700">
          Reports & Analytics
        </h1>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="mt-4 sm:mt-0 border border-red-400 text-red-700 bg-white rounded-md px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-red-50 p-5 rounded-xl shadow-md border border-red-100 text-center hover:scale-[1.03] transition-transform">
          <h3 className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Total Sales
          </h3>
          <p className="text-3xl font-bold text-red-700 mt-2">₹{summary.totalSales || 0}</p>
        </div>

        <div className="bg-red-50 p-5 rounded-xl shadow-md border border-red-100 text-center hover:scale-[1.03] transition-transform">
          <h3 className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Total Bookings
          </h3>
          <p className="text-3xl font-bold text-red-700 mt-2">{summary.totalBookings || 0}</p>
        </div>

        <div className="bg-red-50 p-5 rounded-xl shadow-md border border-red-100 text-center hover:scale-[1.03] transition-transform">
          <h3 className="text-sm uppercase tracking-wide text-red-600 font-semibold">
            Avg Occupancy
          </h3>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {summary.avgOccupancy ? summary.avgOccupancy.toFixed(2) : 0}%
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-center text-red-400 animate-pulse">Loading reports...</p>
      )}

      <div className="grid gap-12">
        {/* SALES REPORT */}
        <section className="bg-white p-6 rounded-xl shadow border border-red-100">
          <h2 className="text-2xl font-semibold mb-4 text-red-700">
            Sales Report
          </h2>
          {sales.length ? (
            <Line
              data={{
                labels: salesLabels,
                datasets: [
                  {
                    label: "Total Sales",
                    data: salesData,
                    borderColor: "rgba(220,38,38,0.9)",
                    backgroundColor: "rgba(220,38,38,0.3)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions}
            />
          ) : (
            <p className="text-red-400">No sales data</p>
          )}
        </section>

        {/* POPULAR MOVIES */}
        <section className="bg-white p-6 rounded-xl shadow border border-red-100">
          <h2 className="text-2xl font-semibold mb-4 text-red-700">
            Popular Movies
          </h2>
          {popular.length ? (
            <Bar
              data={{
                labels: popularLabels,
                datasets: [
                  {
                    label: "Bookings",
                    data: popularCounts,
                    backgroundColor: "rgba(239,68,68,0.7)",
                  },
                ],
              }}
              options={{ ...chartOptions, indexAxis: "y" }}
            />
          ) : (
            <p className="text-red-400">No popular movie data</p>
          )}
        </section>

        {/* THEATER OCCUPANCY */}
        <section className="bg-white p-6 rounded-xl shadow border border-red-100">
          <h2 className="text-2xl font-semibold mb-4 text-red-700">
            Theater Occupancy
          </h2>
          {occupancy.length ? (
            <Bar
              data={{
                labels: occupancyLabels,
                datasets: [
                  {
                    label: "Occupancy %",
                    data: occupancyVals,
                    backgroundColor: "rgba(252,165,165,0.8)",
                    borderColor: "rgba(220,38,38,1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          ) : (
            <p className="text-red-400">No occupancy data</p>
          )}
        </section>

        {/* USER ACTIVITY */}
        <section className="bg-white p-6 rounded-xl shadow border border-red-100">
          <h2 className="text-2xl font-semibold mb-4 text-red-700">
            Top Users (by Spend)
          </h2>
          {users.length ? (
            <Bar
              data={{
                labels: userLabels,
                datasets: [
                  {
                    label: "Total Spent",
                    data: userSpent,
                    backgroundColor: "rgba(239,68,68,0.7)",
                  },
                ],
              }}
              options={{ ...chartOptions, indexAxis: "y" }}
            />
          ) : (
            <p className="text-red-400">No user activity data</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminReport;
