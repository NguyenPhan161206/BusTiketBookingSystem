/**
 * Base: bảng lưu session cho connect-pg-simple.
 * Không đặt bảng nghiệp vụ ở đây - mỗi module tự tạo migration của mình.
 */
exports.up = (knex) =>
  knex.schema.createTable('session', (t) => {
    t.string('sid').primary();
    t.json('sess').notNullable();
    t.timestamp('expire', { precision: 6, useTz: false }).notNullable().index('IDX_session_expire');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('session');
