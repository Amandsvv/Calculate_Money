import express from "express";
import {
  createGroup,
  respondInvite,
  getMyGroups,
  addMember,
  removeMember,
} from "../controllers/group.controllers.js";
import {
  addExpense,
  getExpenses,
  calculateBalance,
  deleteExpense,
} from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Group routes
router.post("/createGroup", verifyJWT, createGroup);
router.post("/:groupId/respond", verifyJWT, respondInvite);
router.get("/my", verifyJWT, getMyGroups);
router.post("/:groupId/members", verifyJWT, addMember);
router.delete("/:groupId/members/:memberId", verifyJWT, removeMember);

// Expense routes
router.post("/:groupId/expenses", verifyJWT, addExpense);
router.get("/:groupId/expenses", verifyJWT, getExpenses);
router.get("/:groupId/balance", verifyJWT, calculateBalance);
router.delete("/:groupId/expenses/:expenseId", verifyJWT, deleteExpense);

export default router;
