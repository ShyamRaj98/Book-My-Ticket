import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { SelectInput } from "../../components/InputFields.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roleUpdate, setRoleUpdate] = useState({});
  const [loadingUsers, setLoadingUsers] = useState([]); // userIds loading

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
      alert("❌ Failed to load users");
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoadingUsers((prev) => [...prev, userId]);
    try {
      await api.delete(`/admin/users/${userId}`);
      alert("✅ User deleted");
      loadUsers();
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    } finally {
      setLoadingUsers((prev) => prev.filter((id) => id !== userId));
    }
  }

  function toggleSelect(userId) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function toggleSelectAll() {
    if (selectedUsers.length === users.length) setSelectedUsers([]);
    else setSelectedUsers(users.map((u) => u._id));
  }

  async function updateUserRole(userId, newRole) {
    if (!window.confirm(`Change role of this user to ${newRole}?`)) return;
    setLoadingUsers((prev) => [...prev, userId]);
    try {
      await api.patch(`/admin/users/roles`, [{ userId, role: newRole }]);
      alert("✅ Role updated successfully");
      setRoleUpdate((prev) => ({ ...prev, [userId]: newRole }));
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("❌ Role update failed");
    } finally {
      setLoadingUsers((prev) => prev.filter((id) => id !== userId));
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>

      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-800 shadow-xl rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="border border-gray-200 p-2 text-left">Name</th>
                <th className="border border-gray-200 p-2 text-left">Email</th>
                <th className="border border-gray-200 p-2 text-left">Role</th>
                <th className="border border-gray-200 p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isLoading = loadingUsers.includes(user._id);
                return (
                  <tr key={user._id} className="hover:bg-red-100">
                    <td className="border border-gray-200 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                      />
                    </td>
                    <td className="border border-gray-200 p-2">{user.name}</td>
                    <td className="border border-gray-200 p-2">{user.email}</td>
                    <td className="border border-gray-200 p-2">
                      <SelectInput
                        options={[
                          { value: "user", label: "User" },
                          { value: "admin", label: "Admin" },
                        ]}
                        value={roleUpdate[user._id] ?? user.role}
                        onChange={(val) => updateUserRole(user._id, val)}
                        placeholder={user.role}
                      />
                      {isLoading && (
                        <span className="ml-2 text-gray-500 animate-pulse">
                          Updating...
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2 text-center space-x-2">
                      <button
                        disabled={isLoading}
                        onClick={() => deleteUser(user._id)}
                        className={`px-3 py-1 rounded text-white ${
                          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500"
                        }`}
                      >
                        {isLoading ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
