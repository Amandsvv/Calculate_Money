import mongoose from "mongoose";
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

const getGroupById = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId)
    .populate("createdBy", "email fullName")
    .populate("members.user", "email fullName")
    .populate("expenses.paidBy", "email fullName")
    .populate("expenses.splitAmong.user", "email fullName");

  if (!group) throw new ApiError(404, "Group not found");

  res.status(200).json({ success: true, group });
});

export{
    createGroup,
    addMember,
    getMyGroups,
    respondInvite,
    removeMember,
    getGroupById
}