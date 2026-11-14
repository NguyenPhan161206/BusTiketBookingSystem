/**
 * Module: catalog
 * Phụ trách: Thành viên 2 - Danh mục vận hành và nội dung
 * Phạm vi: Giao diện quản trị chung (layouts/admin.hbs); bến xe, điểm đón/trả, tuyến, sơ đồ ghế, xe; tin tức, khuyến mãi, FAQ, chính sách; trang tĩnh (layouts/static.hbs, Tailwind).
 *
 * Feature con gợi ý (mỗi feature một thư mục): stations, pickup-points, routes, seat-layouts, buses, news, promotions, faqs, static-pages (Tailwind)
 *   src/modules/catalog/<feature>/
 *     <feature>.routes.js      Routing
 *     <feature>.controller.js  Controller
 *     <feature>.model.js       Model (Knex)
 *     <feature>.service.js     (tùy chọn) nghiệp vụ phức tạp dùng nhiều model
 *     *.hbs                    View -> res.render('catalog/<feature>/<view>')
 *   src/modules/catalog/migrations/, seeds/
 *
 * Đường dẫn đề xuất (router được mount ở "/", khai báo đường dẫn đầy đủ):
 *   /admin/stations/*
 *   /admin/routes/*
 *   /admin/buses/*
 *   /admin/news/*
 *   /news/*
 *   /pages/*
 *   /api/catalog/*
 */
const express = require('express');

const router = express.Router();

// Gắn router của từng feature con, ví dụ:
// router.use(require('./stations/stations.routes'));

module.exports = router;
