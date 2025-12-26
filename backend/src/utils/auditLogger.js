const pool = require("../config/db");

async function logAudit({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress = null,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
       (tenant_id, user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, userId, action, entityType, entityId, ipAddress]
    );
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

module.exports = logAudit;
