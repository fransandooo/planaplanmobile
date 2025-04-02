const express = require("express");

//Import the necessary controller methods
const {
  assignTaskToParticipant,
  pickTaskAsParticipant,
  createListOfTasksForPlan,
  completeTask,
  getAllTasksForPlan,
  getTasksAssignedToUser,
} = require("../controllers/taskController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

//ROUTES - JWT REQUIRED
router.post("/:planId/assign", authenticateToken, assignTaskToParticipant);
router.post("/:planId/pick", authenticateToken, pickTaskAsParticipant);
router.post("/:planId/tasks/bulk", authenticateToken, createListOfTasksForPlan);
router.post("/complete/:taskId", authenticateToken, completeTask);
router.get("/:planId", authenticateToken, getAllTasksForPlan);
router.get("/assigned/me", authenticateToken, getTasksAssignedToUser);

module.exports = router;
