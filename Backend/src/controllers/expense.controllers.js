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

// ✅ View Expenses (by month)
const getExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { month, year } = req.query; // expecting month=9&year=2025 (for example)
  console.log(`Month ${month}, Year : ${year}`)

  const group = await Group.findById(groupId).populate("expenses.paidBy", "name")
                                              .populate("expenses.splitAmong.user", "name email");;

  if (!group) throw new ApiError(404, "Group not found");

  let expenses = group.expenses;

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);         // month - 1 (JS months are 0-based)
    const endDate = new Date(year, month, 0, 23, 59, 59);   // last day of month
    expenses = expenses.filter(exp => {
      const expDate = new Date(exp.createdAt); // assuming you have createdAt in expense schema
      return expDate >= startDate && expDate <= endDate;
    });
  }
   console.log(expenses.map(e => e.splitAmong));
  res.json({ success: true, expenses });
});


// ✅ Calculate Balance (by month)
const calculateBalance = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { month, year } = req.query;

  const group = await Group.findById(groupId).populate("members.user", "email").populate("expenses.paidBy", "email");

  if (!group) throw new ApiError(404, "Group not found");

  // initialize balance for each member
  const balance = {};
  group.members.forEach(m => {
    balance[m.user.email] = 0;
  });

  // filter expenses by month/year
  let expenses = group.expenses;
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    expenses = expenses.filter(exp => {
      const expDate = new Date(exp.createdAt);
      return expDate >= startDate && expDate <= endDate;
    });
  }

  // calculate balances
  expenses.forEach(exp => {
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