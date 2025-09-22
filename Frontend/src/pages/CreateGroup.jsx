import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const memberList = members
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m !== "");

      const res = await api.post("/createGroup", { name, members: memberList });

      if (res.data.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Create Group</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Goa Trip"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Members (emails)</label>
            <input
              type="text"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="alice@mail.com, bob@mail.com"
            />
            <small className="text-gray-500">
              Add multiple emails separated by commas
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}