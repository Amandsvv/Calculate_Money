import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-toastify"; // optional for notifications

export default function GroupDetails() {
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // For editing expenses
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editData, setEditData] = useState({ description: "", amount: 0 });

  // ✅ Fetch group details
  const fetchGroupDetails = async () => {
    try {
      const res = await api.get("/my");
      const found = res.data.groups.find((g) => g._id === groupId);
      setGroup(found || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load group details");
    }
  };

  // ✅ Fetch monthly expenses
  const fetchMonthlyExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${groupId}/monthly?month=${month}&year=${year}`);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh group & expenses
  const refreshData = () => {
    fetchGroupDetails();
    fetchMonthlyExpenses();
  };

  // ✅ Calculate balances
  const handleCalculateBalance = async () => {
    try {
      const res = await api.get(`/${groupId}/balance?month=${month}&year=${year}`);
      setBalances(res.data.balances || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to calculate balances");
    }
  };

  // ✅ Delete expense
  const handleDeleteExpense = async (expenseId) => {
    // Inline confirmation UX (simple toggle)
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api.delete(`/${groupId}/expenses/${expenseId}`);
      toast.success("Expense deleted successfully");
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    }
  };

  // ✅ Start editing expense
  const startEditing = (expense) => {
    setEditingExpenseId(expense._id);
    setEditData({ description: expense.description, amount: expense.amount });
  };

  // ✅ Cancel editing
  const cancelEditing = () => {
    setEditingExpenseId(null);
    setEditData({ description: "", amount: 0 });
  };

  // ✅ Save editing
  const saveEditing = async (expenseId) => {
    try {
      await api.put(`/${groupId}/expenses/${expenseId}`, editData);
      toast.success("Expense updated successfully");
      cancelEditing();
      refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expense");
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line
  }, [groupId, month, year]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
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
            onClick={fetchMonthlyExpenses}
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
            to={`/${groupId}/add-expenses`}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            + Add Expense
          </Link>
        </div>

        <div className="space-y-3 mb-6">
          {expenses.length > 0 ? (
            expenses.map((ex) => (
              <div
                key={ex._id}
                className="p-3 border rounded-lg bg-gray-50 shadow-sm"
              >
                {editingExpenseId === ex._id ? (
                  <>
                    {/* Inline Edit Form */}
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      className="border p-2 rounded w-full mb-2"
                    />
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData({ ...editData, amount: Number(e.target.value) })
                      }
                      className="border p-2 rounded w-full mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEditing(ex._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Expense Details */}
                    <div className="flex justify-between">
                      <span className="font-medium">
                        Description: {ex.description || "No description"}
                      </span>
                      <span className="text-blue-600 font-semibold">₹{ex.amount}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Paid by <strong>{ex.paidBy?.name || ex.paidBy?.email || "Unknown"}</strong>{" "}
                      on {ex.date ? new Date(ex.date).toLocaleDateString() : "—"}
                    </p>
                    <ul className="mt-2 text-sm list-disc list-inside">
                      {ex.splitAmong?.map((s, i) => (
                        <li key={s.user?._id || `split-${i}`}>
                          {s.user?.name || s.user?.email || "Unknown"}: ₹{s.share}
                        </li>
                      ))}
                    </ul>

                    {/* Edit/Delete Buttons */}
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => startEditing(ex)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(ex._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
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