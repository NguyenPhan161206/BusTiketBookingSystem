/**
 * Đọc và chuẩn hóa biến môi trường. Mọi nơi khác chỉ dùng `config` này,
 * KHÔNG đọc process.env trực tiếp.
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const toBool = (value, fallback = false) =>
  value === undefined || value === ''
    ? fallback
    : ['true', '1', 'yes'].includes(String(value).toLowerCase());
const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const env = process.env.NODE_ENV || 'development';
const port = toInt(process.env.PORT, 3000);

const config = {
  env,
  isProduction: env === 'production',
  isTest: env === 'test',
  port,
  appUrl: process.env.APP_URL || `http://localhost:${port}`,

  session: {
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    cookieSecure: toBool(process.env.COOKIE_SECURE),
    maxAgeMinutes: toInt(process.env.SESSION_MAX_AGE_MINUTES, 120),
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME || 'bus_ticket',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  mail: {
    host: process.env.SMTP_HOST || 'localhost',
    port: toInt(process.env.SMTP_PORT, 1025),
    secure: toBool(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.MAIL_FROM || 'Bus Ticket <no-reply@busticket.local>',
  },

  upload: {
    maxSizeMB: toInt(process.env.UPLOAD_MAX_SIZE_MB, 5),
  },

  rateLimit: {
    max: toInt(process.env.RATE_LIMIT_MAX, 1000),
  },

  seedOnStart: toBool(process.env.SEED_ON_START),
};

if (config.isProduction && config.session.secret === 'dev-only-secret') {
  throw new Error('SESSION_SECRET phải được đặt khi chạy production.');
}

module.exports = config;
