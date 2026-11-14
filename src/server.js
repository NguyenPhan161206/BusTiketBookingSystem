const app = require('./app');
const config = require('./config/env');
const db = require('./db/knex');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  logger.info(`Server chạy tại ${config.appUrl} (env: ${config.env})`);
});

const shutdown = (signal) => {
  logger.info(`Nhận ${signal}, đang tắt server...`);
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
