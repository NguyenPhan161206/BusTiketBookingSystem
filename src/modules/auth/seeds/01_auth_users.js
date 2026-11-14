/**
 * Module auth: Seed dữ liệu người dùng mẫu (idempotent).
 * Thứ tự: 01-19 dành cho module auth.
 */
const { hashPassword } = require('../utils/password');

exports.seed = async (knex) => {
  const emails = [
    'admin@busticket.local',
    'staff@busticket.local',
    'customer@busticket.local',
  ];

  await knex('users').whereIn('email', emails).del();

  const now = new Date();

  await knex('users').insert([
    {
      email: 'admin@busticket.local',
      password_hash: hashPassword('Admin@123'),
      full_name: 'Quản trị viên Hệ thống',
      phone: '0901000001',
      role: 'admin',
      is_active: true,
      email_verified_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'staff@busticket.local',
      password_hash: hashPassword('Staff@123'),
      full_name: 'Nhân viên Soát vé',
      phone: '0901000002',
      role: 'staff',
      is_active: true,
      email_verified_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'customer@busticket.local',
      password_hash: hashPassword('Customer@123'),
      full_name: 'Nguyễn Văn Khách',
      phone: '0901000003',
      role: 'customer',
      is_active: true,
      email_verified_at: now,
      created_at: now,
      updated_at: now,
    },
  ]);
};
