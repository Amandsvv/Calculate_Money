import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Trash2, Edit, Plus, Users } from "lucide-react"; // ✅ lucide icons

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editData, setEditData] = useState({ description: "", amount: 0 });

  const navigate = useNavigate();

  // ✅ Delete Group
  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete this group permanently?")) return;
    try {
      await api.delete(`/groups/${groupId}`);
      toast.success("Group deleted successfully");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete group");
    }
  };

  // ✅ Fetch group
  const fetchGroupDetails = async () => {
    try {
      const res = await api.get("/my");
      const found = res.data.groups.find((g) => g._id === groupId);
      setGroup(found || null);
    } catch {
      setError("Failed to load group details");
    }
  };

  // ✅ Fetch expenses
  const fetchMonthlyExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${groupId}/monthly?month=${month}&year=${year}`);
      setExpenses(res.data.expenses || []);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchGroupDetails();
    fetchMonthlyExpenses();
  };

  // ✅ Balance
  const handleCalculateBalance = async () => {
    try {
      const res = await api.get(`/${groupId}/balance?month=${month}&year=${year}`);
      setBalances(res.data.balance || {});
    } catch {
      toast.error("Failed to calculate balances");
    }
  };

  // ✅ Expense delete
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/${groupId}/expenses/${expenseId}`);
      toast.success("Expense deleted");
      refreshData();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  // ✅ Editing
  const startEditing = (expense) => {
    setEditingExpenseId(expense._id);
    setEditData({ description: expense.description, amount: expense.amount });
  };
  const cancelEditing = () => {
    setEditingExpenseId(null);
    setEditData({ description: "", amount: 0 });
  };
  const saveEditing = async (expenseId) => {
    try {
      await api.put(`/${groupId}/expenses/${expenseId}`, editData);
      toast.success("Expense updated");
      cancelEditing();
      refreshData();
    } catch {
      toast.error("Failed to update expense");
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line
  }, [groupId, month, year]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-12">
        {/* Left Panel: Group + Members */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-xl p-6">
            <h1 className="text-2xl font-bold text-center mb-4">{group?.name}</h1>
            <div className="flex flex-wrap gap-3 justify-center">
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
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-500" /> Members
            </h2>
            <ul className="space-y-2">
              {group?.members?.length > 0 ? (
                group.members.map((m, idx) => (
                  <li
                    key={m?.user?._id || idx}
                    className="p-2 rounded bg-gray-100 flex justify-between"
                  >
                    <span>{m?.user?.name}</span>
                    <span className="text-sm text-gray-600">
                      {m?.role}, {m?.status}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No members yet</p>
              )}
            </ul>
            {group?.members?.some((m) => m.role === "admin") && (
              <button
                onClick={handleDeleteGroup}
                className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Delete Group
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Expenses + Balances */}
        <div className="md:col-span-2 space-y-6">
          {/* Expenses */}
          <div className="bg-white shadow rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <Link
                to={`/${groupId}/add-expenses`}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus className="w-4 h-4" /> Add
              </Link>
            </div>

            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.map((ex) => (
                  <div key={ex._id} className="p-4 border rounded-lg hover:shadow-md transition">
                    {editingExpenseId === ex._id ? (
                      <>
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
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{ex.description || "No description"}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            ₹{ex.amount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Paid by <strong>{ex.paidBy?.name || ex.paidBy?.email}</strong> on{" "}
                          {ex.date ? new Date(ex.date).toLocaleDateString() : "—"}
                        </p>
                        <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                          {ex.splitAmong?.map((s, i) => (
                            <li key={s.user?._id || `split-${i}`}>
                              {s.user?.name || s.user?.email}: ₹{s.share}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex gap-3">
                          <button
                            onClick={() => startEditing(ex)}
                            className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-white rounded"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(ex._id)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No expenses recorded yet</p>
            )}
          </div>

          {/* Balances */}
          <div className="bg-white shadow rounded-xl p-6">
            <button
              onClick={handleCalculateBalance}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-4"
            >
              Calculate Balances
            </button>
            {balances && (
              <div>
                <h2 className="font-semibold mb-2">Balances</h2>
                <ul className="space-y-2">
                  {Object.entries(balances).map(([member, balance]) => (
                    <li
                      key={member}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{member}</span>
                      <span
                        className={`font-semibold ${
                          balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {balance >= 0 ? `Gets ₹${balance}` : `Owes ₹${-balance}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
