/**
 * Module: auth
 * Phụ trách: Thành viên 1 - Tài khoản, xác thực và bảo mật
 * Phạm vi: Đăng ký, xác thực email, đăng nhập, quên mật khẩu; hồ sơ, lịch sử đặt vé; phân quyền; quản lý người dùng; bảo mật chung.
 *
 * Feature con gợi ý (mỗi feature một thư mục): register, login, password, profile, users (admin)
 *   src/modules/auth/<feature>/
 *     <feature>.routes.js      Routing
 *     <feature>.controller.js  Controller
 *     <feature>.model.js       Model (Knex)
 *     <feature>.service.js     (tùy chọn) nghiệp vụ phức tạp dùng nhiều model
 *     *.hbs                    View -> res.render('auth/<feature>/<view>')
 *   src/modules/auth/migrations/, seeds/
 *
 * Đường dẫn đề xuất (router được mount ở "/", khai báo đường dẫn đầy đủ):
 *   /auth/*
 *   /account/*
 *   /admin/users/*
 *   /api/auth/*
 *
 * Nhiệm vụ nền: hoàn thiện src/middlewares/auth.js (requireAuth, requireRole) và đặt
 * req.session.user = { id, fullName, email, role } khi đăng nhập.
 */
const express = require('express');

const router = express.Router();

// Gắn router của từng feature con, ví dụ:
// router.use(require('./register/register.routes'));

module.exports = router;
