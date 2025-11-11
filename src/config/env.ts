import { existsSync } from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import type { StringValue } from 'ms';

const envName = process.env.NODE_ENV ?? 'development';

const envFileMap: Record<string, string> = {
  development: 'development.env',
  production: 'production.env',
  test: '.env.test'
};

const candidateFiles = [
  process.env.APP_ENV_FILE,
  envFileMap[envName],
  '.env'
].filter((file): file is string => Boolean(file));

const resolvedEnvFile = candidateFiles.find((file) =>
  existsSync(path.resolve(process.cwd(), file))
);

if (resolvedEnvFile) {
  dotenv.config({ path: path.resolve(process.cwd(), resolvedEnvFile) });
} else {
  dotenv.config();
}

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

