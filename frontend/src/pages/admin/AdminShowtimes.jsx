import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { InputField, SelectInput } from "../../components/InputFields.jsx";

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

    // Always include regular, premium, and vip with default 0 price
    const types = ["regular", "premium", "vip"];
    const prices = types.map((type) => {
      const seat = st.seats.find((s) => s.type === type);
      return { type, price: seat ? seat.price : 0 };
    });

    // Also include all individual seat data
    const allSeats = st.seats.map((s) => ({
      seatId: s.seatId,
      type: s.type,
      price: s.price,
    }));

    // Merge: keep unique seat types + all seats
    setSeatPrices([...prices, ...allSeats]);
  }

  function updateSeatTypePrice(type, newPrice) {
    setSeatPrices((prev) =>
      prev.map((s) =>
        s.type === type ? { ...s, price: Number(newPrice) } : s
      )
    );
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
      <form onSubmit={createShowtime}>
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-col md:flex-row gap-3 ">
            <SelectInput
              label="Select Movie"
              value={form.movieId}
              onChange={(val) => setForm({ ...form, movieId: val })}
              options={movies.map((m) => ({ value: m._id, label: m.title }))}
            />

            <SelectInput
              label="Select Theater"
              value={form.theaterId}
              onChange={(val) => setForm({ ...form, theaterId: val })}
              options={theaters.map((t) => ({ value: t._id, label: t.name }))}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <SelectInput
              label="Select Screen"
              value={form.screenName}
              onChange={(val) => setForm({ ...form, screenName: val })}
              options={screenOptions.map((s) => ({
                value: s.name,
                label: `${s.name} (${s.seats.length} seats)`,
              }))}
              placeholder="Select screen"
            />

            <InputField
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(val) => setForm({ ...form, startTime: val })}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 ">
            <SelectInput
              label="Language"
              value={form.language}
              onChange={(val) => setForm({ ...form, language: val })}
              options={[
                { value: "English", label: "English" },
                { value: "Hindi", label: "Hindi" },
                { value: "Tamil", label: "Tamil" },
                { value: "Malayalam", label: "Malayalam" },
              ]}
            />

            <SelectInput
              label="Format"
              value={form.format}
              onChange={(val) => setForm({ ...form, format: val })}
              options={[
                { value: "2D", label: "2D" },
                { value: "3D", label: "3D" },
                { value: "IMAX", label: "IMAX" },
              ]}
            />
          </div>

          <button className="w-fit mx-auto bg-green-600 text-white px-3 py-2 rounded">
            Create Showtime
          </button>
        </div>
      </form>

      {/* Showtime List */}
      <div className="space-y-2 mt-4">
        {showtimes.map((st) => (
          <div
            key={st._id}
            className="flex justify-between p-2 border border-red-500 border-x-4 rounded-xl items-center flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold">{st.movie?.title || "—"}</div>
              <div className="text-sm text-gray-500">
                {new Date(st.startTime).toLocaleString()} —{" "}
                {st.theater?.name || "—"} — {st.screenName} — {st.language} —{" "}
                {st.format}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Edit Showtime:{" "}
              <span className="text-red-500">
                {editShowtime.movie?.title || ""}
              </span>
            </h2>

            <InputField
              label="Start Time"
              type="datetime-local"
              value={new Date(editShowtime.startTime)
                .toISOString()
                .slice(0, 16)}
              onChange={(val) =>
                setEditShowtime({ ...editShowtime, startTime: val })
              }
            />

            <h3 className="pt-2 mt-4 font-semibold border-t-1 border-gray-500">
              Bulk Seat Price Update
            </h3>
            <div className="flex gap-4 flex-wrap mb-4">
              {["regular", "premium", "vip"].map((type) => (
                <InputField
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  type="number"
                  value={
                    seatPrices.find((s) => s.type === type)?.price ?? 0
                  }
                  onChange={(e) =>
                      updateSeatTypePrice(type, e.target.value)
                    }
                  className="w-24"
                />
              ))}
            </div>

            <h3 className="pt-3 my-3 font-semibold text-black border-t-1 border-gray-500">
              Seat Prices Preview
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-x-4 p-2 rounded-xl">
              {seatPrices.map((s) => (
                <InputField
                  key={s.seatId}
                  label={`${s.seatId} (${s.type})`}
                  type="number"
                  value={s.price ?? 0}
                  onChange={(val) => {
                    const newPrices = seatPrices.map((sp) =>
                      sp.seatId === s.seatId
                        ? { ...sp, price: Number(val) }
                        : sp
                    );
                    setSeatPrices(newPrices);
                  }}
                  className="w-20"
                />
              ))}
            </div>

            <div className="mt-4 flex justify-end space-x-2 flex-wrap">
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
