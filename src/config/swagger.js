/**
 * Tài liệu API (Swagger/OpenAPI) hiển thị tại /api-docs.
 * Mỗi module viết chú thích `@openapi` (YAML) ngay trên route trong routes.js.
 * Xem ví dụ trong CONTRIBUTING.md.
 */
const path = require('node:path');
const swaggerJsdoc = require('swagger-jsdoc');

const modulesGlob = path.resolve(__dirname, '../modules/**/*.js').replace(/\\/g, '/');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Bus Ticket Booking System API',
      version: '0.1.0',
      description:
        'Các endpoint AJAX/JSON của hệ thống. Response chuẩn: `{ success, data, message }`. ' +
        'Request thay đổi dữ liệu (POST/PUT/PATCH/DELETE) cần header `X-CSRF-Token`.',
    },
    servers: [{ url: '/' }],
  },
  apis: [modulesGlob],
});
