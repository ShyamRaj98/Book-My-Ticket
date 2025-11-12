import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { InputField, SelectInput } from "../../components/InputFields.jsx";
import { MdEventSeat } from "react-icons/md";

export default function TheaterSeat() {
  const [layouts, setLayouts] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutName, setLayoutName] = useState("");
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(10);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const seatColors = {
    regular: "text-green-500",
    premium: "text-blue-500",
    vip: "text-purple-500",
    unavailable: "text-gray-500",
  };

  // Load existing layouts on mount
  useEffect(() => {
    fetchLayouts();
    generateLayout(rows, cols);
    // eslint-disable-next-line
  }, []);

  // ✅ Fetch theater admin's layouts
  async function fetchLayouts() {
    try {
      const { data } = await api.get("/theater/seat-layouts");
      setLayouts(data || []);
    } catch (err) {
      console.error("Error loading layouts:", err);
      alert("Failed to load seat layouts");
    }
  }

  // ✅ Generate a new layout grid
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

  // ✅ Select seat for editing
  function handleSeatClick(i) {
    setSelectedSeat(seats[i]);
  }

  // ✅ Update seat properties
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

  // ✅ Save or update layout
  async function saveLayout() {
    if (!layoutName.trim()) return alert("Enter layout name");
    try {
      if (selectedLayout) {
        await api.put(`/theater/seat-layouts/${selectedLayout}`, {
          name: layoutName,
          seats,
        });
        alert("Layout updated successfully");
      } else {
        await api.post("/theater/seat-layouts", { name: layoutName, seats });
        alert("Layout created successfully");
      }
      setLayoutName("");
      setSelectedLayout(null);
      fetchLayouts();
      generateLayout(rows, cols);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Save failed");
    }
  }

  // ✅ Load layout for editing
  function loadLayout(layout) {
    setSelectedLayout(layout._id);
    setLayoutName(layout.name);
    setSeats(layout.seats);
    setRows([...new Set(layout.seats.map((s) => s.row))].length);
    setCols(Math.max(...layout.seats.map((s) => s.number)));
  }

  // ✅ Delete layout
  async function deleteLayout(id) {
    if (!window.confirm("Delete this layout?")) return;
    try {
      await api.delete(`/theater/seat-layouts/${id}`);
      alert("Layout deleted");
      fetchLayouts();
      if (selectedLayout === id) {
        setSelectedLayout(null);
        setLayoutName("");
        generateLayout(rows, cols);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
    }
  }

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-3">
        Theater Seat Layout Manager
      </h1>

      {/* Controls Section */}
      <div className="bg-white border-teal-500 border border-x-4 p-3 md:p-6 rounded-xl shadow-lg grid lg:grid-cols-3 md:grid-cols-2 gap-5">
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
          className="self-end bg-black text-white px-4 py-2 rounded-lg hover:bg-teal-500 transition"
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
      <div className="overflow-auto border-teal-500 border border-x-4 rounded-xl bg-white p-3 md:p-6 shadow-md">
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
              className={`flex flex-col items-center justify-center border rounded text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                seatColors[s.type]
              }`}
              title={`${s.seatId} • ${s.type} • ₹${s.price}`}
            >
              <MdEventSeat className={`text-2xl ${seatColors[s.type]}`} />
              {s.row}
              {s.number}
            </div>
          ))}
        </div>
      </div>

      {/* Seat Edit Modal */}
      {selectedSeat && (
        <div className="w-screen h-screen fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-lg shadow-2xl space-y-5 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Edit Seat — {selectedSeat.seatId}
            </h2>

            <SelectInput
              label="Seat Type"
              value={selectedSeat.type}
              onChange={(v) => setSelectedSeat({ ...selectedSeat, type: v })}
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
                setSelectedSeat({
                  ...selectedSeat,
                  price: Number(e.target.value),
                })
              }
              placeholder="Enter seat price"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedSeat(null)}
                className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSeat(selectedSeat.type, selectedSeat.price);
                }}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Layouts */}
      <div className="bg-white p-6 border-teal-500 border border-x-4 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Saved Layouts
        </h2>
        {layouts.length === 0 ? (
          <p className="text-gray-500 italic">No saved layouts yet.</p>
        ) : (
          <ul className="space-y-3">
            {layouts.map((l) => (
              <li
                key={l._id}
                className="flex justify-between items-center border-teal-500 border border-x-4 p-3 rounded-lg hover:bg-gray-50 transition"
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
                    className="text-teal-600 hover:underline"
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
