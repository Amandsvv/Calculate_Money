import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Expense form states
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);

  // Month filter & balances
  const [month, setMonth] = useState(new Date().getMonth() + 1); // current month
  const [year, setYear] = useState(new Date().getFullYear());
  const [balances, setBalances] = useState(null);

  // Fetch group details with monthly filter
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/groups/${groupId}/monthly?month=${month}&year=${year}`
      );
      setGroup(res.data.group);
    } catch (err) {
      setError("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId, month, year]);

  // Handle member selection in Add Expense form
  const handleMemberSelect = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedMembers([...selectedMembers, value]);
    } else {
      setSelectedMembers(selectedMembers.filter((m) => m !== value));
    }
  };

  // Add expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!payer || selectedMembers.length === 0) {
      alert("Select payer and members for split");
      return;
    }
    setExpenseLoading(true);
    try {
      const res = await api.post(`${groupId}/expenses`, {
        groupId: groupId,
        description: desc,
        amount: Number(amount),
        paidBy: payer,
        splitAmong: selectedMembers.map((m) => ({
          user: m,
          share: Number(amount) / selectedMembers.length, // equal split
        })),
      });
      setGroup((prev) => ({
        ...prev,
        expenses: [...prev.expenses, res.data.expense],
      }));
      setDesc("");
      setAmount("");
      setPayer("");
      setSelectedMembers([]);
    } catch (err) {
      alert("Failed to add expense");
    } finally {
      setExpenseLoading(false);
    }
  };

  // Calculate balances
  const handleCalculateBalance = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/balance?month=${month}&year=${year}`);
      setBalances(res.data.balances);
    } catch (err) {
      alert("Failed to calculate balances");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{group.name}</h1>

        {/* Month Filter */}
        <div className="mb-4 flex gap-4 items-center">
          <label>Month:</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-1 rounded"
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
            className="border p-1 rounded w-20"
          />
          <button
            onClick={fetchGroup}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {/* Members */}
        <h2 className="text-lg font-semibold mb-2">Members</h2>
        <ul className="list-disc list-inside mb-4">
          {group.members.map((m) => (
            <li key={m.user._id}>
              {m.user.email} ({m.role}) - {m.status}
            </li>
          ))}
        </ul>

        {/* Expenses */}
        <h2 className="text-lg font-semibold mb-2">Expenses</h2>
        <ul className="space-y-2 mb-4">
          {group.expenses.length > 0 ? (
            group.expenses.map((ex) => (
              <li
                key={ex._id}
                className="p-2 border rounded flex flex-col"
              >
                <span className="font-medium">
                  {ex.description || "No description"} - ₹{ex.amount} (Paid by {ex.paidBy.email})
                </span>
                <span className="text-sm text-gray-600">
                  Date: {new Date(ex.date).toLocaleDateString()}
                </span>
                <ul className="ml-4 text-sm">
                  {ex.splitAmong.map((s) => (
                    <li key={s.user._id}>
                      {s.user.email}: ₹{s.share}
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No expenses yet</p>
          )}
        </ul>

        {/* Add Expense Form */}
        <h2 className="text-lg font-semibold mb-2">Add Expense</h2>
        <form
          onSubmit={handleAddExpense}
          className="space-y-3 mb-6 bg-gray-100 p-4 rounded"
        >
          <input
            type="text"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Payer</option>
            {group.members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.email}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {group.members.map((m) => (
              <label key={m.user._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={m.user._id}
                  checked={selectedMembers.includes(m.user._id)}
                  onChange={handleMemberSelect}
                />
                {m.user.email}
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={expenseLoading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {expenseLoading ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {/* Calculate Balances */}
        <button
          onClick={handleCalculateBalance}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-4"
        >
          Calculate Balances
        </button>

        {/* Balances Display */}
        {balances && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">Balances</h2>
            <ul className="list-disc list-inside">
              {Object.entries(balances).map(([member, balance]) => (
                <li key={member}>
                  {member}:{" "}
                  <span
                    className={balance >= 0 ? "text-green-600" : "text-red-600"}
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
  );
}
