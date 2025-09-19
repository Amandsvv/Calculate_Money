import  Group  from "../models/groups.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Add Expense
const addExpense = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { description, amount, paidBy, splitAmong } = req.body;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const isMember = group.members.some(
    m => m.user.toString() === req.user._id.toString() && m.status === "accepted"
  );
  if (!isMember) throw new ApiError(403, "You are not a member of this group");

  group.expenses.push({ description, amount, paidBy, splitAmong });
  await group.save();

  res.status(201).json({ success: true, message: "Expense added" });
});

// ✅ View Expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId).populate("expenses.paidBy", "email");

  if (!group) throw new ApiError(404, "Group not found");

  res.json({ success: true, expenses: group.expenses });
});

// ✅ Calculate Balance
const calculateBalance = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId).populate("members.user", "email");

  if (!group) throw new ApiError(404, "Group not found");

  const balance = {};

  group.members.forEach(m => {
    balance[m.user.email] = 0;
  });

  group.expenses.forEach(exp => {
    balance[exp.paidBy.email] += exp.amount;
    exp.splitAmong.forEach(s => {
      const user = group.members.find(m => m.user.toString() === s.user.toString());
      if (user) balance[user.user.email] -= s.share;
    });
  });

  res.json({ success: true, balance });
});

// ✅ Delete Expense
const deleteExpense = asyncHandler(async (req, res) => {
  const { groupId, expenseId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  group.expenses = group.expenses.filter(exp => exp._id.toString() !== expenseId);
  await group.save();

  res.json({ success: true, message: "Expense deleted" });
});

export{
    addExpense,
    getExpenses,
    calculateBalance,
    deleteExpense
}