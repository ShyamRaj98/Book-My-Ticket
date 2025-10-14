// src/pages/AdminSeat.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminSeat() {
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutName, setLayoutName] = useState("");
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(10);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const seatColors = {
    regular: "bg-green-200",
    premium: "bg-yellow-300",
    vip: "bg-purple-300",
    unavailable: "bg-gray-300",
  };

  useEffect(() => {
    fetchLayouts();
    generateLayout(rows, cols);
    // eslint-disable-next-line
  }, []);

  async function fetchLayouts() {
    try {
      const { data } = await api.get("/admin/seat-layouts");
      setLayouts(data || []);
    } catch (err) {
      console.error("Error loading layouts:", err);
    }
  }

  function generateLayout(r, c) {
    const newSeats = [];
    for (let i = 0; i < r; i++) {
      const row = String.fromCharCode(65 + i);
      for (let j = 1; j <= c; j++) {
        newSeats.push({
          seatId: `${row}${j}`,
          row,
          number: j,
          type: "regular",
          price: 200,
        });
      }
    }
    setSeats(newSeats);
  }

  function handleSeatClick(i) {
    setSelectedSeat(seats[i]);
  }

  function updateSeatType(type) {
    if (!selectedSeat) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId === selectedSeat.seatId ? { ...s, type } : s
      )
    );
    setSelectedSeat(null);
  }

  async function saveLayout() {
    if (!layoutName.trim()) return alert("Enter layout name");
    try {
      if (selectedLayout) {
        await api.put(`/admin/seat-layouts/${selectedLayout}`, {
          name: layoutName,
          seats,
        });
        alert("Layout updated");
      } else {
        await api.post("/admin/seat-layouts", { name: layoutName, seats });
        alert("Layout created");
      }
      setLayoutName("");
      setSelectedLayout(null);
      fetchLayouts();
      generateLayout(rows, cols);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  }

  function loadLayout(layout) {
    setSelectedLayout(layout._id);
    setLayoutName(layout.name);
    setSeats(layout.seats);
    setRows([...new Set(layout.seats.map((s) => s.row))].length);
    setCols(Math.max(...layout.seats.map((s) => s.number)));
  }

  async function deleteLayout(id) {
    if (!window.confirm("Delete this layout?")) return;
    try {
      await api.delete(`/admin/seat-layouts/${id}`);
      alert("Deleted");
      fetchLayouts();
      if (selectedLayout === id) {
        setSelectedLayout(null);
        setLayoutName("");
        generateLayout(rows, cols);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎭 Seat Layout Templates</h1>

      {/* Controls */}
      <div className="flex gap-2 bg-white p-4 rounded shadow flex-wrap">
        <input
          placeholder="Layout name"
          className="border p-2 rounded"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 rounded w-20"
          value={rows}
          onChange={(e) => setRows(Number(e.target.value))}
        />
        <input
          type="number"
          className="border p-2 rounded w-20"
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
        />
        <button
          onClick={() => generateLayout(rows, cols)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Generate
        </button>
        <button
          onClick={saveLayout}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          {selectedLayout ? "Update" : "Save"}
        </button>
        {selectedLayout && (
          <button
            onClick={() => {
              setSelectedLayout(null);
              setLayoutName("");
              generateLayout(rows, cols);
            }}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Layout Grid */}
      <div className="overflow-auto border rounded bg-gray-50 p-4">
        <div
          className="grid gap-2 justify-center"
          style={{
            gridTemplateColumns: `repeat(${cols}, 40px)`,
            gridAutoRows: "40px",
          }}
        >
          {seats.map((s, i) => (
            <div
              key={s.seatId}
              onClick={() => handleSeatClick(i)}
              className={`flex items-center justify-center border rounded cursor-pointer ${
                seatColors[s.type]
              }`}
              title={`${s.seatId} • ${s.type} • ₹${s.price}`}
            >
              {s.row}
              {s.number}
            </div>
          ))}
        </div>
      </div>

      {/* Seat type selector popup */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">
              Edit Seat {selectedSeat.seatId}
            </h3>
            <select
              value={selectedSeat.type}
              onChange={(e) => updateSeatType(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="regular">Regular</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSeat(null)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Layouts */}
      <div>
        <h2 className="text-lg font-semibold mt-4">Saved Layouts</h2>
        <ul className="space-y-2">
          {layouts.map((l) => (
            <li
              key={l._id}
              className="flex justify-between items-center bg-white border p-3 rounded"
            >
              <div>
                <div className="font-semibold">{l.name}</div>
                <div className="text-sm text-gray-600">
                  {l.seats.length} seats
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadLayout(l)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteLayout(l._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
