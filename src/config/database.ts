import { createPool, Pool } from 'mysql2/promise';
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

  await db.execute(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(100) NOT NULL AFTER email,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(50) NOT NULL AFTER last_name,
      ADD COLUMN IF NOT EXISTS dob DATE NOT NULL AFTER gender,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NOT NULL AFTER dob;
  `);

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

