import { query } from '../db/connection';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export async function logAudit(
  user: { id?: string; name?: string; role?: string },
  action: string,
  entity: string,
  entityId: string,
  details: string,
  ipAddress?: string
): Promise<AuditLogEntry> {
  const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();
  const userId = user?.id || 'sys-anon';
  const userName = user?.name || 'Editorial Staff';
  const userRole = user?.role || 'Staff';

  try {
    await query(
      `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, details, ip_address, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, userId, userName, userRole, action, entity, entityId, details, ipAddress || null, timestamp]
    );
  } catch (err: any) {
    console.error('[Audit Logger Error]: Failed to persist audit log:', err.message);
  }

  return {
    id,
    userId,
    userName,
    userRole,
    action,
    entity,
    entityId,
    details,
    ipAddress,
    timestamp
  };
}

export async function getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  try {
    const res = await query(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );
    return res.rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      action: r.action,
      entity: r.entity,
      entityId: r.entity_id,
      details: r.details,
      ipAddress: r.ip_address,
      timestamp: r.timestamp
    }));
  } catch (err: any) {
    console.error('[Get Audit Logs Error]:', err.message);
    return [];
  }
}
