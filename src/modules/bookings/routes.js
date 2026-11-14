/**
 * Module: bookings
 * Phụ trách: Thành viên 4 - Đặt vé, chọn ghế và thanh toán
 * Phạm vi: Sơ đồ chọn ghế, giữ ghế; quy trình đặt vé; thanh toán giả lập; tra cứu, hủy vé; dữ liệu dùng chung (điều phối schema chung).
 *
 * Feature con gợi ý (mỗi feature một thư mục): seat-map, seat-hold, checkout, payment, lookup, cancellation
 *   src/modules/bookings/<feature>/
 *     <feature>.routes.js      Routing
 *     <feature>.controller.js  Controller
 *     <feature>.model.js       Model (Knex)
 *     <feature>.service.js     (tùy chọn) nghiệp vụ phức tạp dùng nhiều model
 *     *.hbs                    View -> res.render('bookings/<feature>/<view>')
 *   src/modules/bookings/migrations/, seeds/
 *
 * Đường dẫn đề xuất (router được mount ở "/", khai báo đường dẫn đầy đủ):
 *   /booking/*
 *   /payment/*
 *   /lookup/*
 *   /api/seats/*
 *   /api/bookings/*
 */
const express = require('express');

const router = express.Router();

// Gắn router của từng feature con, ví dụ:
// router.use(require('./seat-map/seat-map.routes'));

module.exports = router;
