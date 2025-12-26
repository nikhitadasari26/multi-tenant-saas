const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { addUser } = require("../controllers/userController");


// ADD USER (tenant admin only)
router.post(
  "/tenants/:tenantId/users",
  authMiddleware,
  addUser
);

module.exports = router;
