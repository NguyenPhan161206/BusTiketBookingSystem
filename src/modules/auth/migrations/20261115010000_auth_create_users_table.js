/**
 * Module auth: Tạo bảng users lưu trữ thông tin người dùng, mật khẩu băm, vai trò và token bảo mật.
 */
exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().unique().index();
    t.string('password_hash').notNullable();
    t.string('full_name').notNullable();
    t.string('phone').nullable();
    t.string('role').notNullable().defaultTo('customer'); // 'customer' | 'staff' | 'admin'
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('email_verified_at', { useTz: true }).nullable();
    t.string('email_verification_token').nullable().index();
    t.string('password_reset_token').nullable().index();
    t.timestamp('password_reset_expires_at', { useTz: true }).nullable();
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
