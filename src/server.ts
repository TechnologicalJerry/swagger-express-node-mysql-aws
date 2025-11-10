import app from './app';
import env from './config/env';
import { getPool, runMigrations } from './config/database';

const start = async () => {
  try {
    await runMigrations();
    // warm the connection pool
    await getPool().getConnection().then((connection) => connection.release());

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled rejection', reason);
});

process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

