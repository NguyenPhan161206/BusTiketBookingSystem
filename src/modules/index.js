/**
 * Tự động mount router của mọi module: src/modules/<tên>/routes.js
 * Mỗi routes.js export một express.Router() và tự khai báo đường dẫn đầy đủ
 * (vd: '/admin/stations', '/api/seats/hold'). Thêm module mới = tạo thư mục mới, không cần sửa file này.
 */
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

module.exports = function mountModules(app) {
  const dirs = fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  dirs.forEach((name) => {
    const routesFile = path.join(__dirname, name, 'routes.js');
    if (!fs.existsSync(routesFile)) return;
    const router = require(routesFile);
    app.use(router);
    logger.info(`Module "${name}" đã được mount.`);
  });
};
