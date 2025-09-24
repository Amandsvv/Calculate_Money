import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState([]);

  useEffect(() => {
    api
      .get(`/groups/${groupId}`)
      .then((res) => {
        setMembers(res.data.group.members || []);
      })
      .catch(() => setMembers([]));
  }, [groupId]);

  const handleCheckboxChange = (userId) => {
    setSplitAmong((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const share = amount / splitAmong.length;

      const splitData = splitAmong.map((id) => ({
        user: id,
        share,
      }));

      await api.post(`/expenses/${groupId}`, {
        description,
        amount,
        paidBy,
        splitAmong: splitData,
      });

      navigate(`/groups/${groupId}/expenses`);
    } catch (error) {
      console.error("Failed to add expense", error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select who paid</option>
          {members.map((m) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.email}
            </option>
          ))}
        </select>

        <div>
          <p className="mb-2 font-semibold">Split among:</p>
          {members.map((m) => (
            <label key={m.user._id} className="block">
              <input
                type="checkbox"
                value={m.user._id}
                checked={splitAmong.includes(m.user._id)}
                onChange={() => handleCheckboxChange(m.user._id)}
              />
              <span className="ml-2">{m.user.email}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}