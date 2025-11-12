import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { InputField, SelectInput } from "../../components/InputFields.jsx";

export default function TheaterShowtimes() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [screens, setScreens] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    movieId: "",
    theaterId: "",
    screenName: "",
    startTime: "",
    language: "English",
    format: "2D",
  });

  const [editShowtime, setEditShowtime] = useState(null);
  const [seatPrices, setSeatPrices] = useState([]);
  const [bulkPrices, setBulkPrices] = useState({
    regular: "",
    premium: "",
    vip: "",
  });

  // ✅ Load all data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [movieRes, theaterRes, showRes] = await Promise.all([
        api.get("/theater/movies"),
        api.get("/theater/my-theaters"),
        api.get("/theater/showtimes"),
      ]);

      setMovies(movieRes.data.movies || []);
      setTheaters(theaterRes.data.theaters || []);
      setShowtimes(showRes.data.showtimes || []);
    } catch (err) {
      console.error("❌ Failed to load theater data:", err);
      alert(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // ✅ When a theater is selected
  useEffect(() => {
    if (!selectedTheater) {
      setScreens([]);
      setForm((f) => ({ ...f, theaterId: "" }));
      return;
    }

    const theater = theaters.find((t) => t._id === selectedTheater);
    if (theater) {
      setScreens(theater.screens || []);
      setForm((f) => ({ ...f, theaterId: theater._id }));
    }
  }, [selectedTheater, theaters]);

  // ✅ Create Showtime
  async function createShowtime(e) {
    e.preventDefault();

    if (!form.theaterId || !form.movieId || !form.screenName || !form.startTime) {
      alert("Please select all fields before creating a showtime");
      return;
    }

    try {
      await api.post("/theater/showtimes", form);
      alert("✅ Showtime created successfully!");
      setForm({
        movieId: "",
        theaterId: selectedTheater,
        screenName: "",
        startTime: "",
        language: "English",
        format: "2D",
      });
      await loadInitialData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Failed to create showtime");
    }
  }

  async function deleteShowtime(id) {
    if (!window.confirm("Delete this showtime?")) return;
    try {
      await api.delete(`/theater/showtimes/${id}`);
      alert("✅ Showtime deleted successfully");
      await loadInitialData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Failed to delete showtime");
    }
  }

  // ✅ Open edit modal
  function openEditModal(st) {
    setEditShowtime({ ...st });
    if (st.seats) {
      setSeatPrices(
        st.seats.map((s) => ({
          seatId: s.seatId,
          type: s.type,
          price: s.price,
        }))
      );
    } else {
      setSeatPrices([]);
    }
    setBulkPrices({ regular: "", premium: "", vip: "" });
  }

  // ✅ Update bulk seat type price
  function updateSeatTypePrice(type, value) {
    const numVal = Number(value);
    if (isNaN(numVal)) return;
    setSeatPrices((prev) =>
      prev.map((s) => (s.type === type ? { ...s, price: numVal } : s))
    );
  }

  // ✅ Save edits
  async function saveEdit() {
    try {
      const payload = {
        startTime: editShowtime.startTime,
        seatPrices,
      };
      await api.patch(`/theater/showtimes/${editShowtime._id}`, payload);
      alert("✅ Showtime updated successfully");
      setEditShowtime(null);
      await loadInitialData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "❌ Failed to update showtime");
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        ⏳ Loading...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-teal-600">
        Theater Showtime Management
      </h1>

      {/* 🎬 Select Theater */}
      <div className="bg-white p-4 rounded-xl shadow border-l-4 border-teal-500">
        <SelectInput
          label="Select Theater"
          value={selectedTheater}
          options={theaters.map((t) => ({
            value: t._id,
            label: `${t.name} (${t.location})`,
          }))}
          onChange={(val) => setSelectedTheater(val)}
        />
        {selectedTheater && (
          <p className="text-sm text-gray-600 mt-1">
            Managing showtimes for <b>{theaters.find(t => t._id === selectedTheater)?.name}</b>
          </p>
        )}
      </div>

      {/* 🎞️ Create Showtime Form */}
      {selectedTheater && (
        <form
          onSubmit={createShowtime}
          className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md space-y-4 border-teal-500 border-x-4"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectInput
              label="Movie"
              value={form.movieId}
              options={movies.map((m) => ({ value: m._id, label: m.title }))}
              onChange={(val) => setForm((f) => ({ ...f, movieId: val }))}
            />

            <SelectInput
              label="Screen"
              options={screens.map((s) => ({
                value: s.name,
                label: `${s.name} (${s.seats?.length || 0} seats)`,
              }))}
              value={form.screenName}
              onChange={(val) => setForm((f) => ({ ...f, screenName: val }))}
            />

            <InputField
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, startTime: e.target.value }))
              }
            />

            <SelectInput
              label="Language"
              options={[
                { value: "English", label: "English" },
                { value: "Hindi", label: "Hindi" },
                { value: "Tamil", label: "Tamil" },
              ]}
              value={form.language}
              onChange={(val) => setForm((f) => ({ ...f, language: val }))}
            />

            <SelectInput
              label="Format"
              options={[
                { value: "2D", label: "2D" },
                { value: "3D", label: "3D" },
                { value: "IMAX", label: "IMAX" },
              ]}
              value={form.format}
              onChange={(val) => setForm((f) => ({ ...f, format: val }))}
            />
          </div>

          <button className="bg-green-600 text-white font-semibold text-lg px-4 py-3 rounded mt-6 mb-4">
            Create Showtime
          </button>
        </form>
      )}

      {/* 🎥 Showtime List */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold mb-4">Showtime List</h1>
        {showtimes.length === 0 ? (
          <div className="text-gray-500 italic">No showtimes found.</div>
        ) : (
          showtimes.map((st) => (
            <div
              key={st._id}
              className="bg-white flex flex-col md:flex-row justify-between items-center border border-teal-500 border-x-4 p-3 rounded-xl"
            >
              <div>
                <div className="text-lg font-semibold text-teal-500">
                  {st.movie?.title || "—"}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  {new Date(st.startTime).toLocaleString()} —{" "}
                  {st.theater?.name || "Unknown"} — {st.screenName} —{" "}
                  {st.language} — {st.format}
                </div>
              </div>
              <div className="flex mt-4 md:mt-0 space-x-2">
                <button
                  onClick={() => openEditModal(st)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteShowtime(st._id)}
                  className="bg-teal-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✏️ Edit Modal */}
      {editShowtime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              Edit Showtime: {editShowtime.movie?.title}
            </h2>

            <label className="block mb-2 font-semibold">Start Time:</label>
            <input
              type="datetime-local"
              value={
                editShowtime.startTime
                  ? new Date(editShowtime.startTime)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setEditShowtime((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
              className="border p-2 rounded w-full mb-4"
            />

            <h3 className="font-semibold mb-2">Bulk Seat Price Update</h3>
            <div className="flex gap-4 mb-4">
              {["regular", "premium", "vip"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <label className="capitalize w-20">{type}</label>
                  <input
                    type="number"
                    className="border p-1 w-24 rounded"
                    value={bulkPrices[type] ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBulkPrices((prev) => ({ ...prev, [type]: val }));
                      updateSeatTypePrice(type, val);
                    }}
                  />
                </div>
              ))}
            </div>

            <h3 className="font-semibold mb-2">Seat Prices Preview</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-2 rounded">
              {seatPrices.map((s) => (
                <div
                  key={s.seatId}
                  className="flex justify-between items-center"
                >
                  <span>
                    {s.seatId} ({s.type})
                  </span>
                  <input
                    type="number"
                    value={s.price ?? ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSeatPrices((prev) =>
                        prev.map((sp) =>
                          sp.seatId === s.seatId ? { ...sp, price: val } : sp
                        )
                      );
                    }}
                    className="border p-1 w-20 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditShowtime(null)}
                className="bg-gray-500 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
