import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../config/database';
import { CreateUserInput, UpdateUserInput, UserRecord } from '../models/user';
import { UserRole } from '../types/auth';

const mapUser = (row: RowDataPacket): UserRecord => ({
  id: row.id,
  uuid: row.uuid,
  email: row.email,
  passwordHash: row.password_hash,
  userName: row.user_name,
  firstName: row.first_name,
  lastName: row.last_name,
  gender: row.gender,
  dob: row.dob instanceof Date ? row.dob.toISOString().split('T')[0] : row.dob,
  phone: row.phone,
  role: row.role as UserRole,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return null;
  return mapUser(rows[0]);
};

export const findUserById = async (id: number): Promise<UserRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
  if (!rows.length) return null;
  return mapUser(rows[0]);
};

export const findUserByUuid = async (uuid: string): Promise<UserRecord | null> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM users WHERE uuid = ?', [uuid]);
  if (!rows.length) return null;
  return mapUser(rows[0]);
};

export const listUsers = async (): Promise<UserRecord[]> => {
  const db = getPool();
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(mapUser);
};

export const createUser = async (input: CreateUserInput & { uuid: string }): Promise<UserRecord> => {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO users (uuid, email, user_name, password_hash, first_name, last_name, gender, dob, phone, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.uuid,
      input.email,
      input.userName,
      input.passwordHash,
      input.firstName,
      input.lastName,
      input.gender,
      input.dob,
      input.phone,
      input.role ?? 'user'
    ]
  );

  const inserted = await findUserById(result.insertId);
  if (!inserted) {
    throw new Error('Failed to retrieve created user');
  }
  return inserted;
};

export const updateUser = async (
  id: number,
  input: UpdateUserInput
): Promise<UserRecord | null> => {
  const db = getPool();
  const updates: string[] = [];
  const values: Array<string | number> = [];

  if (input.email) {
    updates.push('email = ?');
    values.push(input.email);
  }
  if (input.userName) {
    updates.push('user_name = ?');
    values.push(input.userName);
  }
  if (input.firstName) {
    updates.push('first_name = ?');
    values.push(input.firstName);
  }
  if (input.lastName) {
    updates.push('last_name = ?');
    values.push(input.lastName);
  }
  if (input.gender) {
    updates.push('gender = ?');
    values.push(input.gender);
  }
  if (input.dob) {
    updates.push('dob = ?');
    values.push(input.dob);
  }
  if (input.phone) {
    updates.push('phone = ?');
    values.push(input.phone);
  }
  if (input.role) {
    updates.push('role = ?');
    values.push(input.role);
  }
  if (input.passwordHash) {
    updates.push('password_hash = ?');
    values.push(input.passwordHash);
  }

  if (!updates.length) {
    return findUserById(id);
  }

  values.push(id);

  await db.execute(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

  return findUserById(id);
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const db = getPool();
  const [result] = await db.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

