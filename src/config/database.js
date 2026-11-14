/**
 * Cấu hình Knex dùng chung cho app và Knex CLI (knexfile.js).
 *
 * Migration/seed đặt theo module:
 *   src/db/migrations, src/db/seeds                 -> của base (hạ tầng)
 *   src/modules/<module>/migrations, /seeds         -> của từng module
 * Knex gộp tất cả thư mục và chạy theo THỨ TỰ TÊN FILE (timestamp / tiền tố số),
 * nên khóa ngoại giữa các module vẫn đúng thứ tự nếu tạo migration đúng lúc.
 */
const fs = require('node:fs');
const path = require('node:path');
const config = require('./env');

const MODULES_DIR = path.resolve(__dirname, '../modules');

function collectDirs(baseDir, subDir) {
  const moduleDirs = fs.existsSync(MODULES_DIR)
    ? fs
        .readdirSync(MODULES_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(MODULES_DIR, d.name, subDir))
        .filter((dir) => fs.existsSync(dir))
        .sort()
    : [];
  return [baseDir, ...moduleDirs];
}

module.exports = {
  client: 'pg',
  connection: { ...config.db },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: collectDirs(path.resolve(__dirname, '../db/migrations'), 'migrations'),
    tableName: 'knex_migrations',
    sortDirsSeparately: false,
  },
  seeds: {
    directory: collectDirs(path.resolve(__dirname, '../db/seeds'), 'seeds'),
    sortDirsSeparately: false,
  },
  MODULES_DIR,
};
