/**
 * Biến dùng chung cho mọi view (res.locals):
 *   currentUser  - req.session.user hoặc null (TV1 đặt khi đăng nhập)
 *   csrfToken    - token CSRF cho form/AJAX
 *   currentPath  - đường dẫn hiện tại (đánh dấu menu active)
 *   currentQuery - query string hiện tại (dùng cho phân trang, bộ lọc)
 *   appName, year
 */
module.exports = function locals(req, res, next) {
  res.locals.currentUser = (req.session && req.session.user) || null;
  res.locals.csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
  res.locals.currentPath = req.path;
  res.locals.currentQuery = { ...req.query };
  res.locals.appName = 'Bus Ticket';
  res.locals.year = new Date().getFullYear();
  next();
};
