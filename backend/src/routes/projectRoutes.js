const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  deleteProject
} = require("../controllers/projectController");

// CREATE project
router.post("/", authMiddleware, createProject);

// LIST projects
router.get("/", authMiddleware, getProjects);

// DELETE project
router.delete("/:projectId", authMiddleware, deleteProject);

module.exports = router;
