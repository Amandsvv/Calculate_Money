import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-toastify";

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/groups/${groupId}`)
      .then((res) => {
        setMembers(res.data.group.members || []);
      })
      .catch(() => {
        toast.error("Failed to fetch members");
        setMembers([]);
      });
  }, [groupId]);

  const handleCheckboxChange = (userId) => {
    setSplitAmong((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!splitAmong.length) {
      toast.warn("Select at least one member to split the expense");
      return;
    }

    try {
      setLoading(true);
      const share = parseFloat(amount) / splitAmong.length;

      const splitData = splitAmong.map((id) => ({
        user: id,
        share,
      }));

      await api.post(`/${groupId}/add-expenses`, {
        description,
        amount: parseFloat(amount),
        paidBy,
        splitAmong: splitData,
      });

      toast.success("Expense added successfully");
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Failed to add expense", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">➕ Add Expense</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-2xl shadow-md border"
      >
        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Dinner at Cafe"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-green-300"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold mb-1">Amount (₹)</label>
          <input
            type="number"
            placeholder="e.g. 1200"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-green-300"
            required
          />
        </div>

        {/* Who Paid */}
        <div>
          <label className="block text-sm font-semibold mb-1">Who Paid?</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring focus:ring-green-300"
            required
          >
            <option value="">-- Select Member --</option>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name || m.user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Split Among */}
        <div>
          <p className="mb-2 font-semibold">Split Among</p>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <label
                key={m.user._id}
                className="flex items-center space-x-2 border px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={m.user._id}
                  checked={splitAmong.includes(m.user._id)}
                  onChange={() => handleCheckboxChange(m.user._id)}
                />
                <span>{m.user.name || m.user.email}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
