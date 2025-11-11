import { createPool, Pool } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import env from './env';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = createPool({
      host: env.db.host,
      user: env.db.user,
      password: env.db.password,
      port: env.db.port,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: env.db.connectionLimit,
      queueLimit: 0,
      namedPlaceholders: true
    });
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export const runMigrations = async (): Promise<void> => {
  const db = getPool();

  const identifierPattern = /^[a-zA-Z0-9_]+$/;

  const ensureColumn = async (
    table: string,
    column: string,
    columnDefinition: string,
    after?: string
  ) => {
    if (!identifierPattern.test(table) || !identifierPattern.test(column)) {
      throw new Error('Invalid table or column identifier');
    }
    if (after && !identifierPattern.test(after)) {
      throw new Error('Invalid reference column identifier');
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`
    );
    if (!rows.length) {
      const afterClause = after ? ` AFTER \`${after}\`` : '';
      await db.execute(
        `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${columnDefinition}${afterClause}`
      );
    }
  };

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      user_name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      dob DATE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=INNODB;
  `);

  await ensureColumn('users', 'user_name', 'VARCHAR(100) NOT NULL', 'email');
  await ensureColumn('users', 'gender', 'VARCHAR(50) NOT NULL', 'last_name');
  await ensureColumn('users', 'dob', 'DATE NOT NULL', 'gender');
  await ensureColumn('users', 'phone', 'VARCHAR(20) NOT NULL', 'dob');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      stock INT NOT NULL DEFAULT 0,
      created_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=INNODB;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=INNODB;
  `);
};

