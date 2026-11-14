/**
 * Session lưu trong PostgreSQL (bảng "session", tạo bởi migration base).
 *
 * HỢP ĐỒNG CHUNG: sau khi đăng nhập, module auth (TV1) đặt
 *   req.session.user = { id, fullName, email, role }   // role: 'customer' | 'staff' | 'admin'
 * Các module khác chỉ đọc req.session.user / res.locals.currentUser.
 */
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const config = require('./env');

module.exports = session({
  store: new PgSession({
    conObject: config.db,
    tableName: 'session',
    createTableIfMissing: false,
  }),
  name: 'bts.sid',
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.session.cookieSecure,
    maxAge: config.session.maxAgeMinutes * 60 * 1000,
  },
});
