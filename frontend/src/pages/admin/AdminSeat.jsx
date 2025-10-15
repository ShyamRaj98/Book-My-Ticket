import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { InputField, SelectInput } from "../../components/InputFields.jsx";

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
    premium: "bg-blue-200",
    vip: "bg-purple-200",
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

  function updateSeat(type, price) {
    if (!selectedSeat) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId === selectedSeat.seatId
          ? { ...s, type: type || s.type, price: price || s.price }
          : s
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
        alert("Layout updated successfully");
      } else {
        await api.post("/admin/seat-layouts", { name: layoutName, seats });
        alert("Layout created successfully");
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
      alert("Layout deleted");
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
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-3">
        🎭 Seat Layout Editor
      </h1>

      {/* Controls Section */}
      <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg grid lg:grid-cols-3 md:grid-cols-2 gap-5">
        <InputField
          label="Layout Name"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          placeholder="Enter layout name"
        />
        <InputField
          label="Rows"
          type="number"
          value={rows}
          onChange={(e) => setRows(Number(e.target.value))}
        />
        <InputField
          label="Columns"
          type="number"
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
        />
        <button
          onClick={() => generateLayout(rows, cols)}
          className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Generate
        </button>
        <button
          onClick={saveLayout}
          className="self-end bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {selectedLayout ? "Update" : "Save"}
        </button>
      </div>

      {/* Seat Grid */}
      <div className="overflow-auto border rounded-xl bg-white p-3 md:p-6 shadow-md">
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
              className={`flex items-center justify-center border rounded text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
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

      {/* Seat Edit Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-2xl space-y-5 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Edit Seat — {selectedSeat.seatId}
            </h2>

            <SelectInput
              label="Seat Type"
              value={selectedSeat.type}
              onChange={(v) => updateSeat(v)}
              options={[
                { label: "Regular", value: "regular" },
                { label: "Premium", value: "premium" },
                { label: "VIP", value: "vip" },
                { label: "Unavailable", value: "unavailable" },
              ]}
            />

            <InputField
              label="Price (₹)"
              type="number"
              value={selectedSeat.price}
              onChange={(e) =>
                updateSeat(selectedSeat.type, Number(e.target.value))
              }
              placeholder="Enter seat price"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedSeat(null)}
                className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Layouts */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          💾 Saved Layouts
        </h2>
        {layouts.length === 0 ? (
          <p className="text-gray-500 italic">No saved layouts yet.</p>
        ) : (
          <ul className="space-y-3">
            {layouts.map((l) => (
              <li
                key={l._id}
                className="flex justify-between items-center border p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <div className="font-medium text-gray-700">{l.name}</div>
                  <div className="text-sm text-gray-500">
                    {l.seats.length} seats
                  </div>
                </div>
                <div className="flex gap-3">
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
        )}
      </div>
    </div>
  );
}
