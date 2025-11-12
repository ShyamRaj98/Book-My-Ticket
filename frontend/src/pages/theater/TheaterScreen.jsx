// src/pages/TheaterScreen.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { SelectInput, TypeSelectInput } from "../../components/InputFields.jsx";

export default function TheaterScreen() {
  const [theaters, setTheaters] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [screens, setScreens] = useState([]);
  const [form, setForm] = useState({ theaterId: "", screenName: "", layoutId: "" });
  const [editMode, setEditMode] = useState(false);
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    loadMyTheaters();
    loadLayouts();
  }, []);

  useEffect(() => {
    const selectedTheater = theaters.find((t) => t._id === form.theaterId);
    setScreens(selectedTheater?.screens || []);
  }, [form.theaterId, theaters]);

  async function loadMyTheaters() {
    try {
      const { data } = await api.get("/theater/my-theaters");
      setTheaters(data.theaters || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load your theaters");
    }
  }

  async function loadLayouts() {
    try {
      const { data } = await api.get("/theater/seat-layouts");
      setLayouts(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load layouts");
    }
  }

  async function saveScreen() {
    if (!form.theaterId || !form.screenName)
      return alert("Select theater and enter screen name");

    try {
      if (editMode) {
        await api.put(`/theater/screens/${form.theaterId}`, {
          oldName: originalName,
          newName: form.screenName,
          layoutId: form.layoutId || undefined,
        });
        alert("Screen updated");
      } else {
        await api.post(`/theater/screens/${form.theaterId}`, {
          name: form.screenName,
          layoutId: form.layoutId || undefined,
        });
        alert("Screen added");
      }
      setForm({ theaterId: "", screenName: "", layoutId: "" });
      setEditMode(false);
      setOriginalName("");
      loadMyTheaters();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  }

  async function deleteScreen(theaterId, screenName) {
    if (!window.confirm(`Delete screen "${screenName}"?`)) return;
    try {
      await api.delete(`/theater/screens/${theaterId}/${screenName}`);
      alert("Screen deleted");
      loadMyTheaters();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function editScreen(theaterId, screen) {
    const layout = layouts.find((l) => l.name === screen.layoutName);
    setForm({
      theaterId,
      screenName: screen.name,
      layoutId: layout ? layout._id : "",
    });
    setEditMode(true);
    setOriginalName(screen.name);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Your Screens</h1>

      <div className="bg-white border border-teal-500 border-x-4 p-4 rounded-xl shadow space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <SelectInput
            label="Select Theater"
            value={form.theaterId}
            onChange={(val) => setForm({ ...form, theaterId: val })}
            options={theaters.map((t) => ({ value: t._id, label: t.name }))}
          />

          <TypeSelectInput
            label="Screen Name"
            value={form.screenName}
            onChange={(val) => setForm({ ...form, screenName: val })}
            options={screens.map((s) => ({ value: s.name, label: s.name }))}
            placeholder="Enter screen name"
          />

          <SelectInput
            label="Select Layout (optional)"
            value={form.layoutId}
            onChange={(val) => setForm({ ...form, layoutId: val })}
            options={layouts.map((l) => ({ value: l._id, label: l.name }))}
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={saveScreen}
            className={`${editMode ? "bg-yellow-500" : "bg-green-600"} text-white px-4 py-2 rounded`}
          >
            {editMode ? "Update Screen" : "Add Screen"}
          </button>

          {editMode && (
            <button
              onClick={() => {
                setEditMode(false);
                setForm({ theaterId: "", screenName: "", layoutId: "" });
                setOriginalName("");
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-4">Your Theaters & Screens</h2>
        {theaters.map((t) => (
          <div key={t._id} className="border border-teal-500 border-x-4 rounded-xl p-3 mt-2 bg-white">
            <h3 className="font-bold mb-1">{t.name}</h3>
            <div className="text-sm text-gray-600 mb-2">{t.location}</div>

            {t.screens?.length ? (
              <ul className="space-y-2">
                {t.screens.map((s) => (
                  <li key={s._id} className="flex justify-between items-center flex-wrap">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-gray-500">
                        {s.layoutName || "No layout"} • Seats: {s.seats?.length || 0}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => editScreen(t._id, s)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Seat Edit
                      </button>
                      <button
                        onClick={() => deleteScreen(t._id, s.name)}
                        className="text-teal-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">No screens yet</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
