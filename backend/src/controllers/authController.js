const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");

async function registerTenant(req, res) {
  const client = await pool.connect();

  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName,
    } = req.body;

    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await client.query("BEGIN");

    // Check subdomain uniqueness
    const subdomainCheck = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists",
      });
    }

    // Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants 
       (name, subdomain, subscription_plan, max_users, max_projects)
       VALUES ($1, LOWER($2), 'free', 5, 3)
       RETURNING id, name, subdomain`,
      [tenantName, subdomain.toLowerCase()]
    );

    const tenant = tenantResult.rows[0];

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const userResult = await client.query(
      `INSERT INTO users
   (tenant_id, email, password_hash, full_name, role, is_active)
   VALUES ($1, $2, $3, $4, 'tenant_admin', true)
   RETURNING id, email, role, full_name`,
      [tenant.id, adminEmail, passwordHash, adminFullName]
    );


    const adminUser = userResult.rows[0];

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
        adminUser,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    client.release();
  }
}

// LOGIN USER
async function loginUser(req, res) {
  console.log("LOGIN BODY:", req.body); 
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password || !tenantSubdomain) {
    return res.status(400).json({
      success: false,
      message: "Email, password, and tenantSubdomain are required",
    });
  }

  try {
    // 1️⃣ Find tenant
    const tenantResult = await pool.query(
      `SELECT id, status FROM tenants 
      WHERE LOWER(subdomain) = LOWER($1)`,
      [tenantSubdomain.trim()]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active",
      });
    }

    // 2️⃣ Find user
    const userResult = await pool.query(
      `SELECT id, email, password_hash, role, full_name, is_active
       FROM users
       WHERE email = $1 AND tenant_id = $2`,
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Generate JWT
    const token = generateToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    // 5️⃣ Response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


module.exports = {
  registerTenant,
  loginUser,
};
