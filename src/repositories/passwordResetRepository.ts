import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../config/database';
import { PasswordResetTokenRecord } from '../models/passwordReset';

const mapToken = (row: RowDataPacket): PasswordResetTokenRecord => ({
  id: row.id,
  userId: row.user_id,
  token: row.token,
  expiresAt: row.expires_at,
  used: Boolean(row.used),
  createdAt: row.created_at
});

export const createPasswordResetToken = async (
  userId: number,
  token: string,
  expiresAt: Date
): Promise<PasswordResetTokenRecord> => {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );

  const created = await findPasswordResetTokenById(result.insertId);
  if (!created) {
    throw new Error('Failed to create password reset token');
  }
  return created;
};

export const findValidPasswordResetToken = async (
  token: string
): Promise<PasswordResetTokenRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT * FROM password_reset_tokens
     WHERE token = ? AND used = 0 AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [token]
  );

  if (!rows.length) return null;
  return mapToken(rows[0]);
};

export const markPasswordResetTokenUsed = async (id: number): Promise<void> => {
  const db = getPool();
  await db.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [id]);
};

const findPasswordResetTokenById = async (id: number): Promise<PasswordResetTokenRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM password_reset_tokens WHERE id = ?', [id]);
  if (!rows.length) return null;
  return mapToken(rows[0]);
};

