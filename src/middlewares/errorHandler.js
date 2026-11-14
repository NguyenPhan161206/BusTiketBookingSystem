/**
 * 404 + xử lý lỗi tập trung.
 * - Request AJAX/API  -> JSON chuẩn { success:false, data:null, message }
 * - Request trang     -> render errors/404 hoặc errors/error
 *
 * Express 5 tự chuyển lỗi của async handler vào đây, KHÔNG cần try/catch hay asyncHandler.
 * Ném lỗi có status:  throw createError(404, 'Không tìm thấy chuyến xe');
 */
const createError = require('http-errors');
const config = require('../config/env');
const logger = require('../utils/logger');

const wantsJson = (req) =>
  req.xhr || req.path.startsWith('/api/') || (req.get('accept') || '').includes('application/json');

function notFound(req, _res, next) {
  next(createError(404, 'Không tìm thấy trang bạn yêu cầu.'));
}

function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  if (isServerError) logger.error(err);

  let message =
    err.expose === false || isServerError ? 'Đã có lỗi xảy ra, vui lòng thử lại sau.' : err.message;
  if (err.code === 'EBADCSRFTOKEN') {
    message = 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng tải lại trang và thử lại.';
  }

  if (res.headersSent) return;

  res.status(status);

  if (wantsJson(req)) {
    return res.json({ success: false, data: null, message });
  }

  const layout =
    req.path.startsWith('/admin') || req.path.startsWith('/staff') ? 'admin' : 'customer';
  return res.render(status === 404 ? 'errors/404' : 'errors/error', {
    layout,
    title: status === 404 ? 'Không tìm thấy trang' : 'Lỗi',
    status,
    message,
    stack: !config.isProduction && isServerError ? err.stack : null,
  });
}

module.exports = { notFound, errorHandler };
