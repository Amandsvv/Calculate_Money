import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/my")
      .then((res) => {
        setGroups(res.data.groups || []);
        setLoading(false);
      })
      .catch(() => {
        setGroups([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, <span className="text-blue-600">{user?.name}</span>
        </h1>
      </header>

      {/* Groups Section */}
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Groups</h2>
          <Link
            to="/groups/create"
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Create Group
          </Link>
        </div>

        {loading ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500">You are not part of any group yet.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g._id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <Link
                  to={`/groups/${g._id}`}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}