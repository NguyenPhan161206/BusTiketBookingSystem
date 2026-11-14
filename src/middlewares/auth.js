/**
 * ⚠️ STUB - TV1 (Tài khoản, xác thực và bảo mật) sẽ viết logic thật.
 *
 * Chữ ký hàm đã cố định để các module khác dùng ngay từ bây giờ:
 *   const { requireAuth, requireRole } = require('../../../middlewares/auth');
 *   router.get('/account/bookings', requireAuth, controller.history);
 *   router.use('/admin', requireRole('admin'));
 *   router.get('/staff/trips/:id/passengers', requireRole('staff', 'admin'), controller.list);
 *
 * Hiện tại cả hai đều cho qua (next()) để mọi người phát triển song song.
 */
const logger = require('../utils/logger');

let warned = false;
const warnOnce = () => {
  if (!warned) {
    logger.warn('middlewares/auth.js đang là STUB - chưa kiểm tra đăng nhập/phân quyền.');
    warned = true;
  }
};

function requireAuth(_req, _res, next) {
  warnOnce();
  return next();
}

function requireRole(..._roles) {
  return (_req, _res, next) => {
    warnOnce();
    return next();
  };
}

module.exports = { requireAuth, requireRole };
