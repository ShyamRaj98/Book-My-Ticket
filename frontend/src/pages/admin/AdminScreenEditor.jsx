// src/pages/AdminScreenEditor.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminScreenEditor() {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [selectedScreenName, setSelectedScreenName] = useState("");
  const [screenSeats, setScreenSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTheaters();
  }, []);

  useEffect(() => {
    if (selectedTheaterId && selectedScreenName) loadScreen();
    else setScreenSeats([]);
  }, [selectedTheaterId, selectedScreenName]);

  /** Fetch theaters */
  async function fetchTheaters() {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/theaters-list");
      setTheaters(data.theaters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /** Load screen seat template */
  async function loadScreen() {
    try {
      const { data } = await api.get(`/admin/theaters/${selectedTheaterId}`);
      const screen = data.theater.screens.find(
        (s) => s.name === selectedScreenName
      );
      setScreenSeats(screen?.seats || []);
    } catch (err) {
      console.error(err);
      setScreenSeats([]);
    }
  }

  /** Cycle seat type */
  function cycleSeatType(idx) {
    setScreenSeats((prev) => {
      const copy = [...prev];
      const types = ["regular", "premium", "unavailable"];
      const current = copy[idx].type || "regular";
      const next = types[(types.indexOf(current) + 1) % types.length];
      copy[idx] = { ...copy[idx], type: next };
      return copy;
    });
  }

  /** Update seat price */
  function updateSeatPrice(idx, price) {
    setScreenSeats((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], price: Number(price) || 0 };
      return copy;
    });
  }

  /** Save screen template */
  async function saveScreenTemplate() {
    if (!selectedTheaterId || !selectedScreenName)
      return alert("Select theater & screen first");
    try {
      await api.post(`/admin/screens/${selectedTheaterId}`, {
        name: selectedScreenName,
        seats: screenSeats,
      });
      alert("Screen template saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save template");
    }
  }

  /** Import CSV */
  async function importCSV(e) {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file || !selectedTheaterId || !selectedScreenName)
      return alert("Select theater & screen and choose CSV");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(
        `/admin/screens/upload-csv/${selectedTheaterId}/${selectedScreenName}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("CSV imported successfully");
      loadScreen();
    } catch (err) {
      console.error(err);
      alert("CSV import failed");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Screen & Seat Management</h1>

      {/* Theater + Screen selector */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedTheaterId}
          onChange={(e) => setSelectedTheaterId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Theater</option>
          {theaters.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Screen name"
          value={selectedScreenName}
          onChange={(e) => setSelectedScreenName(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={loadScreen}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Load
        </button>
      </div>

      {/* Seats editor */}
      {!screenSeats.length && (
        <div className="text-gray-500 text-sm">No seats loaded</div>
      )}
      <div className="space-y-2 max-h-96 overflow-auto">
        {Object.keys(screenSeats.reduce((m, s) => ((m[s.row] = true), m), {}))
          .sort()
          .map((rowKey) => (
            <div key={rowKey} className="flex items-center gap-3">
              <div className="w-6 font-semibold">{rowKey}</div>
              <div className="flex gap-2">
                {screenSeats
                  .filter((s) => s.row === rowKey)
                  .sort((a, b) => a.number - b.number)
                  .map((seat, idx) => {
                    const index = screenSeats.findIndex(
                      (s) => s.seatId === seat.seatId
                    );
                    return (
                      <div
                        key={seat.seatId}
                        className="flex flex-col items-center"
                      >
                        <button
                          onClick={() => cycleSeatType(index)}
                          className={`w-10 h-10 rounded border ${
                            seat.type === "premium"
                              ? "bg-yellow-300"
                              : seat.type === "unavailable"
                              ? "bg-gray-300"
                              : "bg-white"
                          }`}
                        >
                          {seat.number}
                        </button>
                        <input
                          value={seat.price}
                          onChange={(e) =>
                            updateSeatPrice(index, e.target.value)
                          }
                          className="w-12 text-sm p-1 border rounded mt-1"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={saveScreenTemplate}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          Save Template
        </button>
        <form onSubmit={importCSV}>
          <input type="file" name="file" accept=".csv" className="text-sm" />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded ml-2"
          >
            Import CSV
          </button>
        </form>
      </div>
    </div>
  );
}
