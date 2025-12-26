const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected test route
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;
