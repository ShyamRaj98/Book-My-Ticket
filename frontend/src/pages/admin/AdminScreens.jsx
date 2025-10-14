// src/pages/AdminScreen.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminScreen() {
  const [theaters, setTheaters] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [form, setForm] = useState({ theaterId: "", screenName: "", layoutId: "" });
  const [editMode, setEditMode] = useState(false);
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    loadTheaters();
    loadLayouts();
  }, []);

  async function loadTheaters() {
    try {
      const { data } = await api.get("/admin/theaters-list");
      setTheaters(data.theaters || []);
    } catch (err) {
      console.error("Failed to load theaters:", err);
    }
  }

  async function loadLayouts() {
    try {
      const { data } = await api.get("/admin/seat-layouts");
      setLayouts(data || []);
    } catch (err) {
      console.error("Failed to load layouts:", err);
    }
  }

  async function saveScreen() {
    if (!form.theaterId || !form.screenName) return alert("Please select theater and enter screen name.");
    try {
      if (editMode) {
        // update existing: send oldName, newName, layoutId (optional)
        await api.put(`/admin/screens/${form.theaterId}`, {
          oldName: originalName,
          newName: form.screenName,
          layoutId: form.layoutId || undefined,
        });
        alert("Screen updated");
      } else {
        await api.post(`/admin/screens/${form.theaterId}`, {
          name: form.screenName,
          layoutId: form.layoutId || undefined,
        });
        alert("Screen added");
      }
      setForm({ theaterId: "", screenName: "", layoutId: "" });
      setEditMode(false);
      setOriginalName("");
      loadTheaters();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  }

  async function deleteScreen(theaterId, screenName) {
    if (!window.confirm(`Delete screen "${screenName}"?`)) return;
    try {
      await api.delete(`/admin/screens/${theaterId}/${screenName}`);
      alert("Screen deleted");
      loadTheaters();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function editScreen(theaterId, screen) {
    // find layoutId for screen.layoutName
    const layout = layouts.find((l) => l.name === screen.layoutName);
    setForm({ theaterId, screenName: screen.name, layoutId: layout ? layout._id : "" });
    setEditMode(true);
    setOriginalName(screen.name);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎬 Screen Management</h1>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded shadow">
        <select value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Theater</option>
          {theaters.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <input value={form.screenName} onChange={(e) => setForm({ ...form, screenName: e.target.value })} placeholder="Screen name" className="border p-2 rounded" />

        <select value={form.layoutId} onChange={(e) => setForm({ ...form, layoutId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Layout (optional)</option>
          {layouts.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
        </select>

        <button onClick={saveScreen} className={`${editMode ? "bg-yellow-500" : "bg-green-600"} text-white px-4 py-2 rounded`}>
          {editMode ? "Update Screen" : "Add Screen"}
        </button>

        {editMode && <button onClick={() => { setEditMode(false); setForm({ theaterId: "", screenName: "", layoutId: "" }); setOriginalName(""); }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-4">📜 Theaters & Screens</h2>
        {theaters.map((t) => (
          <div key={t._id} className="border rounded p-3 mt-2 bg-white">
            <h3 className="font-bold mb-1">{t.name}</h3>
            <div className="text-sm text-gray-600 mb-2">{t.location}</div>

            {t.screens && t.screens.length ? (
              <ul className="space-y-2">
                {t.screens.map((s) => (
                  <li key={`${t._id}-${s._id}`} className="flex justify-between items-center py-1">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.layoutName || "No layout"} • Seats: {s.seats?.length || 0}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editScreen(t._id, s)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      <button onClick={() => deleteScreen(t._id, s.name)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">No screens</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
