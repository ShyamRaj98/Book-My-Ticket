import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { InputField } from "../../components/InputFields.jsx";
import { useSelector } from "react-redux";

export default function TheaterManage() {
  const [theaters, setTheaters] = useState([]);
  const [form, setForm] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    loadTheaters();
  }, []);

  async function loadTheaters() {
    setLoading(true);
    try {
      const { data } = await api.get("/theater/my-theaters");
      const myTheaters = (data.theaters || []).filter(
        (t) => t.owner === user._id || t.isApproved
      );
      setTheaters(myTheaters);
    } catch (err) {
      console.error("Failed to load theaters:", err);
      alert("Failed to load theaters");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Theater name is required");
    try {
      if (editId) {
        await api.put(`/theater/my-theaters/${editId}`, form);
        alert("Updated successfully");
      } else {
        await api.post("/theater/my-theaters", form);
        alert("Theater created successfully");
      }
      resetForm();
      loadTheaters();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Operation failed");
    }
  }

  function resetForm() {
    setForm({ name: "", location: "" });
    setEditId(null);
  }

  function editTheater(t) {
    setForm({ name: t.name, location: t.location });
    setEditId(t._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTheater(id) {
    if (!window.confirm("Are you sure you want to delete this theater?"))
      return;
    try {
      await api.delete(`/theater/my-theaters/${id}`);
      alert("Deleted successfully");
      loadTheaters();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete theater");
    }
  }

  return (
    <div className="p-6 space-y-6 bg-teal-50 min-h-screen">
      <h1 className="text-2xl font-bold text-teal-700">
        My Approved Theaters
      </h1>

      {/* ➕ Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-xl shadow-md border-x-4 border-teal-600"
      >
        <InputField
          label="Theater Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Enter theater name"
        />

        <InputField
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Enter location"
        />

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className={`${
              editId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-teal-600 hover:bg-teal-700"
            } text-white px-6 py-2 rounded-md font-semibold transition`}
          >
            {editId ? "Update" : "Create"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md font-semibold transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* 🎬 Theaters List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-teal-600 font-semibold">Loading theaters...</div>
        )}

        {!loading && theaters.length === 0 && (
          <div className="text-gray-500 text-center italic">
            No approved theaters found.
          </div>
        )}

        {theaters.map((t) => (
          <div
            key={t._id}
            className="flex justify-between items-center bg-white border-x-4 border-teal-600 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div>
              <div className="font-semibold text-lg text-teal-700">
                {t.name}
              </div>
              <div className="text-sm text-gray-600">{t.location}</div>
              <div className="text-xs text-gray-400">
                Screens: {t.screens?.length || 0}
              </div>
              <div
                className={`text-xs mt-1 font-semibold ${
                  t.isApproved ? "text-green-600" : "text-orange-500"
                }`}
              >
                {t.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editTheater(t)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-md font-medium transition"
              >
                Edit
              </button>

              {/* 🗑️ Show delete only for approved theaters */}
              {t.isApproved && (
                <button
                  onClick={() => deleteTheater(t._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md font-medium transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
