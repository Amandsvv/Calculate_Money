import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [balances, setBalances] = useState(null);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/monthly?month=${month}&year=${year}`);
      setGroup(res.data.group || {});
    } catch (err) {
      console.error(err);
      setError("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId, month, year]);

  const handleCalculateBalance = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/balance?month=${month}&year=${year}`);
      setBalances(res.data.balances || {});
    } catch (err) {
      console.error(err);
      alert("Failed to calculate balances");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {/* Group Name */}
        <h1 className="text-2xl font-bold mb-6 text-center">{group?.name}</h1>

        {/* Month Filter */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
          <label className="font-medium">Month:</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-2 rounded"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-2 rounded w-24"
          />
          <button
            onClick={fetchGroup}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {/* Members */}
        <h2 className="text-lg font-semibold mb-2">Members</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {group?.members?.length > 0 ? (
            group.members.map((m, idx) => (
              <li
                key={m?.user?._id || idx}
                className="p-2 bg-gray-100 rounded shadow-sm"
              >
                <span className="font-medium">{m?.user?.email}</span> —{" "}
                <span className="text-sm text-gray-600">
                  {m?.role}, {m?.status}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No members yet</p>
          )}
        </ul>

        {/* Expenses */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <Link
            to={`/groups/${groupId}/add-expense`}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            + Add Expense
          </Link>
        </div>

        <div className="space-y-3 mb-6">
          {group?.expenses?.length > 0 ? (
            group.expenses.map((ex, idx) => (
              <div
                key={ex?._id || `expense-${idx}`}
                className="p-3 border rounded-lg bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{ex?.description || "No description"}</span>
                  <span className="text-blue-600 font-semibold">₹{ex?.amount}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Paid by <strong>{ex?.paidBy?.email || "Unknown"}</strong>{" "}
                  on {ex?.date ? new Date(ex.date).toLocaleDateString() : "—"}
                </p>
                <ul className="mt-2 text-sm list-disc list-inside">
                  {ex?.splitAmong?.map((s, i) => (
                    <li key={s?.user?._id || `split-${i}`}>
                      {s?.user?.email || "Unknown"}: ₹{s?.share}
                    </li>
                  ))}
                </ul>
                {/* Edit/Delete buttons */}
                <div className="mt-2 flex gap-3">
                  <button className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No expenses recorded yet</p>
          )}
        </div>

        {/* Calculate Balances */}
        <button
          onClick={handleCalculateBalance}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-6"
        >
          Calculate Balances
        </button>

        {balances && (
          <div className="p-4 border rounded bg-gray-50 shadow">
            <h2 className="font-semibold mb-2">Balances</h2>
            <ul className="list-disc list-inside">
              {Object.entries(balances).map(([member, balance]) => (
                <li key={member}>
                  {member}:{" "}
                  <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                    {balance >= 0 ? `Gets ₹${balance}` : `Owes ₹${-balance}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}