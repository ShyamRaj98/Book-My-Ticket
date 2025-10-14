import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const AdminReports = () => {
  const [sales, setSales] = useState({
    totalSales: 0,
    totalBookings: 0,
    topMovies: [],
  });
  const [occupancy, setOccupancy] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        const to = new Date();

        const [salesRes, occRes] = await Promise.all([
          axios.get(
            `/api/admin/reports/sales?from=${from.toISOString()}&to=${to.toISOString()}`
          ),
          axios.get(`/api/admin/reports/occupancy`),
        ]);

        const s = salesRes.data || {};
        setSales({
          totalSales: s.totalSales || 0,
          totalBookings: s.totalBookings || 0,
          topMovies: Array.isArray(s.topMovies) ? s.topMovies : [],
        });

        setOccupancy(Array.isArray(occRes.data) ? occRes.data : []);
      } catch (err) {
        console.error("❌ fetchReports error:", err);
        alert("Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold mb-6">📊 Admin Reports Dashboard</h2>

      {/* 🧾 Sales Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">
          Sales Summary (Last 7 Days)
        </h3>
        <p>
          Total Sales:{" "}
          <strong>₹{Number(sales.totalSales || 0).toFixed(2)}</strong>
        </p>
        <p>
          Total Bookings: <strong>{sales.totalBookings || 0}</strong>
        </p>

        {sales.topMovies?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Top Movies:</h4>
            <ul className="list-disc ml-6">
              {sales.topMovies.map((m, i) => (
                <li key={i}>
                  {m.title} — ₹{Number(m.totalSales || 0).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 🎟️ Occupancy Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Occupancy Report</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="movie" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="occupancy" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Occupancy Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Occupancy Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={occupancy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="startTime"
              tickFormatter={(val) =>
                val ? new Date(val).toLocaleTimeString() : ""
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(val) => new Date(val).toLocaleString()}
              formatter={(val) => [`${val}%`, "Occupancy"]}
            />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminReports;
