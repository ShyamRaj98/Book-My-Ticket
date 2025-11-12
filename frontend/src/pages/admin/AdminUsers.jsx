import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loading from "../../components/Loading.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("user"); // "user" or "theater"

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [usersRes, theatersRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/users/theaters"),
      ]);
      setUsers(usersRes.data.users || []);
      setTheaters(theatersRes.data.theaters || []);
      console.log("user", usersRes.data.users);
      console.log("theater", theatersRes.data.theaters);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function toggleApproval(type, id) {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.patch(`/admin/${type}/${id}/approve`);
      loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to update approval");
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadAll();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  const filteredUsers = filter === "user" ? users : theaters;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-6 py-2 font-semibold shadow-xl rounded ${
            filter === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("user")}
        >
          Users
        </button>
        <button
          className={`px-6 py-0 font-semibold shadow-xl rounded ${
            filter === "theater" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setFilter("theater")}
        >
          Theaters
        </button>
      </div>

      {loading ? (
        <Loading loader="user" text="Loading..." />
      ) : filteredUsers.length === 0 ? (
        <div>No records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px] w-full border border-red-300 rounded-lg overflow-hidden">
            <table className="w-full bg-white border border-red-300 shadow-md rounded-lg overflow-scroll">
              <thead>
                <tr className="bg-red-100">
                  <th className="p-2 border border-red-300">Name</th>
                  <th className="p-2 border border-red-300">Email</th>
                  <th className="p-2 border border-red-300">Role</th>
                  <th className="p-2 border border-red-300 text-sm">Delete Approved</th>
                  <th className="p-2 borderborder-red-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-red-50">
                    <td className="p-2 border border-red-300 font-semibold">{u.name || u.owner?.name}</td>
                    <td className="p-2 border border-red-300">
                      {u.email || u.owner?.email || "-"}
                    </td>
                    <td className="p-2 border border-red-300">{u.role || "theater"}</td>
                    <td className="p-2 border border-red-300 text-center">
                      <button
                        className={`px-3 py-1 rounded ${
                          u.isApproved
                            ? "bg-green-500 text-white"
                            : "bg-yellow-400"
                        }`}
                        onClick={() =>
                          toggleApproval(
                            filter === "user" ? "users" : "users/theaters",
                            u._id
                          )
                        }
                      >
                        {u.isApproved ? "Approved" : "Pending"}
                      </button>
                    </td>
                    <td className="p-2 border border-red-300 text-center">
                      {filter === "user" && (
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => deleteUser(u._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
