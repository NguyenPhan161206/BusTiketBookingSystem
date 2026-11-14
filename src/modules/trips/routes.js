/**
 * Module: trips
 * Phụ trách: Thành viên 3 - Lịch chạy và tìm kiếm chuyến
 * Phạm vi: Giao diện khách hàng chung (layouts/customer.hbs); quản lý chuyến, lập lịch, điểm dừng, vòng đời chuyến; trang chủ, tìm chuyến, chi tiết chuyến.
 *
 * Feature con gợi ý (mỗi feature một thư mục): home, trip-admin, schedules, trip-stops, search, trip-detail
 *   src/modules/trips/<feature>/
 *     <feature>.routes.js      Routing
 *     <feature>.controller.js  Controller
 *     <feature>.model.js       Model (Knex)
 *     <feature>.service.js     (tùy chọn) nghiệp vụ phức tạp dùng nhiều model
 *     *.hbs                    View -> res.render('trips/<feature>/<view>')
 *   src/modules/trips/migrations/, seeds/
 *
 * Đường dẫn đề xuất (router được mount ở "/", khai báo đường dẫn đầy đủ):
 *   / (trang chủ - thay trang tạm của base)
 *   /trips/*
 *   /admin/trips/*
 *   /api/trips/*
 *   /api/locations/*
 */
const express = require('express');

const router = express.Router();

// Gắn router của từng feature con, ví dụ:
// router.use(require('./home/home.routes'));

module.exports = router;
