const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

// CREATE task
router.post("/tasks", authMiddleware, createTask);

// LIST tasks by projectId
router.get("/tasks", authMiddleware, getTasks);

// UPDATE task status
router.put("/tasks/:taskId", authMiddleware, updateTaskStatus);

// DELETE task
router.delete("/tasks/:taskId", authMiddleware, deleteTask);

module.exports = router;
