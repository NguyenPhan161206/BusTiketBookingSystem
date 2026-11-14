/**
 * Module: operations
 * Phụ trách: Thành viên 5 - Vé điện tử, vận hành, báo cáo và trợ lý ảo
 * Phạm vi: Vé điện tử, email vé; quản lý đặt chỗ; soát vé; dashboard, báo cáo; trợ lý ảo; triển khai, kiểm thử tích hợp.
 *
 * Feature con gợi ý (mỗi feature một thư mục): e-tickets, booking-admin, check-in, dashboard, reports, chatbot
 *   src/modules/operations/<feature>/
 *     <feature>.routes.js      Routing
 *     <feature>.controller.js  Controller
 *     <feature>.model.js       Model (Knex)
 *     <feature>.service.js     (tùy chọn) nghiệp vụ phức tạp dùng nhiều model
 *     *.hbs                    View -> res.render('operations/<feature>/<view>')
 *   src/modules/operations/migrations/, seeds/
 *
 * Đường dẫn đề xuất (router được mount ở "/", khai báo đường dẫn đầy đủ):
 *   /tickets/*
 *   /admin (dashboard)
 *   /admin/bookings/*
 *   /admin/reports/*
 *   /staff/*
 *   /api/chatbot/*
 *   /api/reports/*
 */
const express = require('express');

const router = express.Router();

// Gắn router của từng feature con, ví dụ:
// router.use(require('./e-tickets/e-tickets.routes'));

module.exports = router;
