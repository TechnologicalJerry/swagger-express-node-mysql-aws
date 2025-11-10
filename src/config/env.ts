import dotenv from 'dotenv';
import path from 'path';
import type { StringValue } from 'ms';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const number = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: number(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as StringValue | number,
  resetTokenExpiryMinutes: number(process.env.RESET_TOKEN_EXPIRY_MINUTES, 15),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: number(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'app_db',
    connectionLimit: number(process.env.DB_CONNECTION_LIMIT, 10)
  }
};

export default env;

