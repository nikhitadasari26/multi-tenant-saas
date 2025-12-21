const express = require("express");
const router = express.Router();
const { registerTenant } = require("../controllers/authController");

router.post("/register-tenant", registerTenant);

module.exports = router;
