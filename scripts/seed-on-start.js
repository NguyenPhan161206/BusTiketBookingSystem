/**
 * Chạy seed khi container khởi động nếu SEED_ON_START=true.
 * Seed phải idempotent (chạy lại nhiều lần không lỗi / không nhân đôi dữ liệu).
 */
const config = require('../src/config/env');
const db = require('../src/db/knex');
const logger = require('../src/utils/logger');

(async () => {
  if (!config.seedOnStart) {
    logger.info('SEED_ON_START=false - bỏ qua seed.');
    return;
  }
  const [files] = await db.seed.run();
  logger.info(`Đã chạy ${files.length} file seed.`);
})()
  .catch((err) => {
    logger.error('Seed thất bại:', err);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
