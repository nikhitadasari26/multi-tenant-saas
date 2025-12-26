const express = require("express");
const router = express.Router();
const { registerTenant, loginUser } = require("../controllers/authController");


router.post("/register-tenant", registerTenant);

// Login user
router.post("/login", loginUser);


module.exports = router;
