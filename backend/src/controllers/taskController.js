const pool = require("../config/db");
const logAudit = require("../utils/auditLogger");

/**
 * CREATE TASK
 * POST /api/tasks
 */
async function createTask(req, res) {
  const { projectId, title, status, assignedTo } = req.body;
  const { tenantId, userId } = req.user;


  if (!projectId || !title) {
    return res.status(400).json({
      success: false,
      message: "projectId and title are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks 
       (project_id, tenant_id, title, status, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, status`,
      [
        projectId,
        tenantId,
        title,
        status || "todo",
        assignedTo || null,
      ]
    );

    await logAudit({
      tenantId,
      userId,
      action: "CREATE_TASK",
      entityType: "task",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * LIST TASKS BY PROJECT (Query param)
 * GET /api/tasks?projectId=...
 */
async function getTasks(req, res) {
  const { projectId } = req.query;
  const tenantId = req.user.tenantId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "projectId is required",
    });
  }

  try {
    // 🔒 Verify project belongs to tenant
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    const result = await pool.query(
      `SELECT id, title, status, created_at
       FROM tasks
       WHERE project_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [projectId, tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * UPDATE TASK STATUS
 * PUT /api/tasks/:taskId
 */
async function updateTaskStatus(req, res) {
  const { taskId } = req.params;
  const { status } = req.body;
  const tenantId = req.user.tenantId;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "status is required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2 AND tenant_id = $3
       RETURNING id, status`,
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * DELETE TASK
 * DELETE /api/tasks/:taskId
 */
async function deleteTask(req, res) {
  const { taskId } = req.params;
  const tenantId = req.user.tenantId;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [taskId, tenantId]
    );

    // ❌ Task not found → no audit log
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ AUDIT LOG (ADD HERE)
    await logAudit({
      tenantId,
      userId,
      action: "DELETE_TASK",
      entityType: "task",
      entityId: taskId,
      ipAddress: req.ip,
    });

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
};
