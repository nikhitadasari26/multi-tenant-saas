const bcrypt = require("bcrypt");
const pool = require("../config/db"); // your pg pool
const { generateToken } = require("../utils/jwt");

async function registerTenant(req, res) {
  const client = await pool.connect(); // ✅ FIX

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
       VALUES ($1, $2, 'free', 5, 3)
       RETURNING id, name, subdomain`,
      [tenantName, subdomain]
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
    client.release(); // ✅ VERY IMPORTANT
  }
}


module.exports = {
  registerTenant,
};
