const bcrypt = require("bcrypt");
const pool = require("../config/db");
const logAudit = require("../utils/auditLogger");

// ADD USER (tenant admin only)
async function addUser(req, res) {
  // ✅ destructure INSIDE function
  const { tenantId } = req.params;
  const { email, password, fullName } = req.body;
  const { role, tenantId: loggedTenantId, userId } = req.user;

  // ✅ validation
  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: "Email, password and full name are required",
    });
  }

  // 🔐 only tenant_admin allowed
  if (role !== "tenant_admin") {
    return res.status(403).json({
      success: false,
      message: "Only tenant admin can add users",
    });
  }

  // 🔐 tenant isolation
  if (tenantId !== loggedTenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized tenant access",
    });
  }

  try {
    // 1️⃣ count existing users
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE tenant_id = $1",
      [tenantId]
    );
    const userCount = parseInt(countResult.rows[0].count);

    // 2️⃣ get max_users
    const tenantResult = await pool.query(
      "SELECT max_users FROM tenants WHERE id = $1",
      [tenantId]
    );
    const maxUsers = tenantResult.rows[0].max_users;

    if (userCount >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: "User limit reached for your subscription plan",
      });
    }

    // 3️⃣ hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ insert user
    const result = await pool.query(
      `INSERT INTO users
       (tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, 'user', true)
       RETURNING id, email, full_name, role`,
      [tenantId, email, passwordHash, fullName]
    );

    // 🧾 AUDIT LOG
    await logAudit({
      tenantId,
      userId,
      action: "CREATE_USER",
      entityType: "user",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Add user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = {
  addUser,
};
