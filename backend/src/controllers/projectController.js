const pool = require("../config/db");
const logAudit = require("../utils/auditLogger");

// CREATE PROJECT
async function createProject(req, res) {
  try {
    const { name, description } = req.body;
    const { tenantId, userId } = req.user;

    // 1️⃣ Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // 2️⃣ Count existing projects for this tenant
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    const projectCount = parseInt(countResult.rows[0].count);

    // 3️⃣ Get max_projects limit from tenant
    const tenantResult = await pool.query(
      "SELECT max_projects FROM tenants WHERE id = $1",
      [tenantId]
    );

    const maxProjects = tenantResult.rows[0].max_projects;

    // 4️⃣ Block if subscription limit reached
    if (projectCount >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached for your subscription plan",
      });
    }

    // 5️⃣ Create project (only if allowed)
    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, status, created_by)
       VALUES ($1, $2, 'active', $3)
       RETURNING id, name`,
      [tenantId, name, userId]
    );
    
    await logAudit({
      tenantId,
      userId,
      action: "CREATE_PROJECT",
      entityType: "project",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function getProjects(req, res) {
  try {
    const tenantId = req.user.tenantId;

    const result = await pool.query(
      `SELECT id, name, description, created_at
       FROM projects
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function deleteProject(req, res) {
  const { projectId } = req.params;
  const { tenantId, userId } = req.user;

  try {
    const result = await pool.query(
      `DELETE FROM projects
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ AUDIT LOG
    await logAudit({
      tenantId,
      userId,
      action: "DELETE_PROJECT",
      entityType: "project",
      entityId: projectId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = {
  createProject,
  getProjects,
  deleteProject
};
