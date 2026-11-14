const createError = require('http-errors');
const { fail } = require('../utils/apiResponse');

/**
 * Kiểm tra xem request có phải yêu cầu JSON/AJAX hay không.
 */
function isApiOrAjaxRequest(req) {
  return (
    req.xhr ||
    req.path.startsWith('/api') ||
    (req.headers.accept && req.headers.accept.includes('application/json'))
  );
}

/**
 * Middleware bắt buộc phải đăng nhập.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  if (isApiOrAjaxRequest(req)) {
    return fail(res, 'Vui lòng đăng nhập để tiếp tục', 401);
  }

  if (req.session) {
    req.session.returnTo = req.originalUrl;
  }
  req.flash('warning', 'Vui lòng đăng nhập để tiếp tục');
  return res.redirect('/auth/login');
}

/**
 * Middleware bắt buộc vai trò người dùng (vd: 'admin', 'staff').
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      if (isApiOrAjaxRequest(req)) {
        return fail(res, 'Vui lòng đăng nhập để tiếp tục', 401);
      }
      if (req.session) {
        req.session.returnTo = req.originalUrl;
      }
      req.flash('warning', 'Vui lòng đăng nhập để tiếp tục');
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.session.user.role)) {
      if (isApiOrAjaxRequest(req)) {
        return fail(res, 'Bạn không có quyền truy cập chức năng này', 403);
      }
      return next(createError(403, 'Bạn không có quyền truy cập chức năng này'));
    }

    return next();
  };
}

/**
 * Middleware điều hướng người dùng đã đăng nhập (tránh truy cập lại trang login/register).
 */
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/');
  }
  return next();
}

module.exports = {
  requireAuth,
  requireRole,
  redirectIfAuth,
};
