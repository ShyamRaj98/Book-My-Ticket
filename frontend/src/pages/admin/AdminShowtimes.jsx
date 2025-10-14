import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminShowtimes() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [screenOptions, setScreenOptions] = useState([]);
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

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (form.theaterId) {
      const theater = theaters.find((t) => t._id === form.theaterId);
      setScreenOptions(theater ? theater.screens : []);
      setForm((prev) => ({ ...prev, screenName: "" }));
    } else {
      setScreenOptions([]);
    }
  }, [form.theaterId, theaters]);

  async function loadAll() {
    try {
      const [mRes, tRes, sRes] = await Promise.all([
        api.get("/admin/movies"),
        api.get("/admin/theaters-list"),
        api.get("/admin/showtimes"),
      ]);
      setMovies(mRes.data.movies || []);
      setTheaters(tRes.data.theaters || []);
      setShowtimes(sRes.data.showtimes || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createShowtime(e) {
    e.preventDefault();
    try {
      await api.post("/admin/showtimes", form);
      alert("Showtime created");
      setForm({
        movieId: "",
        theaterId: "",
        screenName: "",
        startTime: "",
        language: "English",
        format: "2D",
      });
      loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to create showtime");
    }
  }

  async function deleteShowtime(id) {
    if (!confirm("Delete this showtime?")) return;
    try {
      await api.delete(`/admin/showtimes/${id}`);
      alert("Deleted successfully");
      loadAll();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function openEditModal(st) {
    setEditShowtime({ ...st });
    setSeatPrices(
      st.seats.map((s) => ({ seatId: s.seatId, type: s.type, price: s.price }))
    );
  }

  function updateSeatTypePrice(type, newPrice) {
    const updated = seatPrices.map((s) =>
      s.type === type ? { ...s, price: newPrice } : s
    );
    setSeatPrices(updated);
  }

  async function saveEdit() {
    try {
      const payload = {
        startTime: editShowtime.startTime,
        seatPrices,
      };
      await api.patch(`/admin/showtimes/${editShowtime._id}`, payload);
      alert("Showtime updated");
      setEditShowtime(null);
      loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to update showtime");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Showtime Management</h1>

      {/* Create Showtime */}
      <form
        onSubmit={createShowtime}
        className="grid grid-cols-1 md:grid-cols-4 gap-2"
      >
        <select
          value={form.movieId}
          onChange={(e) => setForm({ ...form, movieId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Movie</option>
          {movies.map((m) => (
            <option key={m._id} value={m._id}>
              {m.title}
            </option>
          ))}
        </select>

        <select
          value={form.theaterId}
          onChange={(e) => setForm({ ...form, theaterId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Theater</option>
          {theaters.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={form.screenName}
          onChange={(e) => setForm({ ...form, screenName: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Screen</option>
          {screenOptions.map((s, idx) => (
            <option key={idx} value={s.name}>
              {s.name} ({s.seats.length} seats)
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Tamil">Tamil</option>
        </select>

        <select
          value={form.format}
          onChange={(e) => setForm({ ...form, format: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="2D">2D</option>
          <option value="3D">3D</option>
          <option value="IMAX">IMAX</option>
        </select>

        <button className="bg-green-600 text-white px-3 py-1 rounded col-span-full md:col-auto">
          Create Showtime
        </button>
      </form>

      {/* Showtime List */}
      <div className="space-y-2 mt-4">
        {showtimes.map((st) => (
          <div
            key={st._id}
            className="flex justify-between p-2 border rounded items-center"
          >
            <div>
              <div className="font-semibold">{st.movie?.title || "—"}</div>
              <div className="text-sm text-gray-500">
                {new Date(st.startTime).toLocaleString()} —{" "}
                {st.theater?.name || "—"} — {st.screenName} — {st.language} —{" "}
                {st.format}
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => openEditModal(st)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteShowtime(st._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editShowtime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-2/3 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Edit Showtime: {editShowtime.movie?.title}
            </h2>

            <label className="block mb-2">
              Start Time:
              <input
                type="datetime-local"
                value={new Date(editShowtime.startTime)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setEditShowtime({
                    ...editShowtime,
                    startTime: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />
            </label>

            <h3 className="mt-4 font-semibold">Bulk Seat Price Update</h3>
            <div className="flex gap-4 mb-4">
              <div>
                <label>Regular:</label>
                <input
                  type="number"
                  className="border p-1 w-24 rounded"
                  onChange={(e) =>
                    updateSeatTypePrice("regular", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label>Premium:</label>
                <input
                  type="number"
                  className="border p-1 w-24 rounded"
                  onChange={(e) =>
                    updateSeatTypePrice("premium", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label>VIP:</label>
                <input
                  type="number"
                  className="border p-1 w-24 rounded"
                  onChange={(e) =>
                    updateSeatTypePrice("premium", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <h3 className="mt-2 font-semibold">Seat Prices Preview</h3>
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
                    value={s.price}
                    onChange={(e) => {
                      const newPrices = seatPrices.map((sp) =>
                        sp.seatId === s.seatId
                          ? { ...sp, price: Number(e.target.value) }
                          : sp
                      );
                      setSeatPrices(newPrices);
                    }}
                    className="border p-1 w-20 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setEditShowtime(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-green-600 text-white px-3 py-1 rounded"
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
