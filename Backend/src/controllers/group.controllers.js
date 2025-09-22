import  Group  from "../models/groups.model.js";
import  User  from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Create Group
const createGroup = asyncHandler(async (req, res) => {
  const { name, members } = req.body;

  if (!name || !Array.isArray(members)) {
    throw new ApiError(400, "Group name and members are required");
  }

  const users = await User.find({ email: { $in: members } });

  const group = await Group.create({
    name,
    createdBy: req.user._id,
    members: [
      { user: req.user._id, status: "accepted", role: "admin" },
      ...users.map(u => ({ user: u._id }))
    ],
  });

  res.status(201).json({
    success: true,
    message: "Group created successfully",
    group,
  });
});

// ✅ Respond to Invite
const respondInvite = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { status } = req.body;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const member = group.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member) throw new ApiError(403, "You are not invited to this group");

  member.status = status;
  await group.save();

  res.json({ success: true, message: `Invite ${status}` });
});

// ✅ View My Groups
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ "members.user": req.user._id })
    .populate("members.user", "email");

  res.json({ success: true, groups });
});

// ✅ Add Member (Admin only)
const addMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const me = group.members.find(m => m.user.toString() === req.user._id.toString());
  if (!me || me.role !== "admin") throw new ApiError(403, "Only admin can add members");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (group.members.some(m => m.user.toString() === user._id.toString())) {
    throw new ApiError(409, "User already in group");
  }

  group.members.push({ user: user._id });
  await group.save();

  res.json({ success: true, message: "Member added, awaiting acceptance" });
});

// ✅ Remove Member
const removeMember = asyncHandler(async (req, res) => {
  const { groupId, memberId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const me = group.members.find(m => m.user.toString() === req.user._id.toString());
  if (!me || me.role !== "admin") throw new ApiError(403, "Only admin can remove members");

  group.members = group.members.filter(m => m.user.toString() !== memberId);
  await group.save();

  res.json({ success: true, message: "Member removed" });
});

const getMonthlyGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { month, year } = req.query;


  if (!groupId || !month || !year) {
    throw new ApiError(400, "groupId, month, and year are required");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // ✅ Fetch the group first
  const group = await Group.findById(groupId)
    .populate("members.user", "email name")
    .lean();

  if (!group) throw new ApiError(404, "Group not found");

  // ✅ Case 1: Group has no expenses at all
  if (!group.expenses || group.expenses.length === 0) {
    return res.status(200).json({
      success: true,
      group: { ...group, expenses: [] },
    });
  }

  // ✅ Case 2: Group has expenses → run aggregation
  const expenses = await Group.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(groupId) } },
    { $unwind: "$expenses" },
    { $match: { "expenses.date": { $gte: startDate, $lt: endDate } } },

    // Lookup who paid
    {
      $lookup: {
        from: "users",
        localField: "expenses.paidBy",
        foreignField: "_id",
        as: "paidByUser",
      },
    },
    { $unwind: { path: "$paidByUser", preserveNullAndEmptyArrays: true } },

    // Map splitAmong (userId + share)
    {
      $addFields: {
        "expenses.splitAmong": {
          $map: {
            input: "$expenses.splitAmong",
            as: "s",
            in: {
              userId: "$$s.user",
              share: "$$s.share",
            },
          },
        },
      },
    },

    // Lookup splitAmong user details
    {
      $lookup: {
        from: "users",
        localField: "expenses.splitAmong.userId",
        foreignField: "_id",
        as: "splitUsers",
      },
    },

    // Replace splitAmong userId with full user details
    {
      $addFields: {
        "expenses.splitAmong": {
          $map: {
            input: "$expenses.splitAmong",
            as: "s",
            in: {
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$splitUsers",
                      as: "u",
                      cond: { $eq: ["$$u._id", "$$s.userId"] },
                    },
                  },
                  0,
                ],
              },
              share: "$$s.share",
            },
          },
        },
      },
    },

    // Group back
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        members: { $first: "$members" },
        expenses: {
          $push: {
            _id: "$expenses._id",
            description: "$expenses.description",
            amount: "$expenses.amount",
            date: "$expenses.date",
            paidBy: {
              _id: "$paidByUser._id",
              email: "$paidByUser.email",
            },
            splitAmong: "$expenses.splitAmong",
          },
        },
      },
    },
  ]);
  console.log(expenses)

  if (!expenses.length) {
    // No expenses in this month
    return res.status(200).json({
      success: true,
      group: { ...group, expenses: [] },
    });
  }

  return res.status(200).json({ success: true, group: expenses[0] });
});

const calculateMonthlyBalances = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { month, year } = req.query;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const group = await Group.findById(groupId).populate("members.user").populate("expenses.paidBy").populate("expenses.splitAmong.user");

  if (!group) throw new ApiError(404, "Group not found");

  const balances = {};
  group.members.forEach((m) => (balances[m.user.email] = 0));

  group.expenses.forEach((exp) => {
    exp.splitAmong.forEach((s) => {
      balances[s.user.email] -= s.share;
    });
    balances[exp.paidBy.email] += exp.amount;
  });

  res.json({ success: true, balances });
});

export{
    createGroup,
    addMember,
    getMyGroups,
    respondInvite,
    removeMember,
    getMonthlyGroupExpenses,
    calculateMonthlyBalances
}