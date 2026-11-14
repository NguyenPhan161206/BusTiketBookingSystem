const createError = require('http-errors');
const User = require('./users.model');
const { hashPassword } = require('../utils/password');
const { parsePageParams } = require('../../../utils/paginate');

module.exports = {
  async list(req, res) {
    const { page, perPage } = parsePageParams(req.query);
    const search = req.query.search || '';
    const role = req.query.role || 'all';
    const status = req.query.status || 'all';

    const { data, pagination } = await User.list({
      page,
      perPage,
      search,
      role,
      status,
    });

    res.render('auth/users/list', {
      layout: 'admin',
      title: 'Quản lý người dùng',
      users: data,
      pagination,
      filters: { search, role, status },
    });
  },

  showCreateForm(req, res) {
    res.render('auth/users/create', {
      layout: 'admin',
      title: 'Thêm tài khoản mới',
      values: {},
    });
  },

  async handleCreate(req, res) {
    const { fullName, email, phone, password, role } = req.body;
    const values = { fullName, email, phone, role };

    if (!fullName || !email || !password) {
      req.flash('danger', 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return res.render('auth/users/create', {
        layout: 'admin',
        title: 'Thêm tài khoản mới',
        values,
      });
    }

    if (password.length < 6) {
      req.flash('danger', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return res.render('auth/users/create', {
        layout: 'admin',
        title: 'Thêm tài khoản mới',
        values,
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('danger', 'Email này đã tồn tại trong hệ thống.');
      return res.render('auth/users/create', {
        layout: 'admin',
        title: 'Thêm tài khoản mới',
        values,
      });
    }

    const passwordHash = hashPassword(password);
    const validRoles = ['customer', 'staff', 'admin'];
    const chosenRole = validRoles.includes(role) ? role : 'customer';

    await User.create({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      password_hash: passwordHash,
      role: chosenRole,
      is_active: true,
      email_verified_at: new Date(),
    });

    req.flash('success', 'Đã tạo tài khoản người dùng thành công.');
    return res.redirect('/admin/users');
  },

  async showDetail(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError(404, 'Không tìm thấy người dùng này.');
    }

    res.render('auth/users/detail', {
      layout: 'admin',
      title: `Chi tiết người dùng: ${user.full_name}`,
      user,
    });
  },

  async handleUpdate(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError(404, 'Không tìm thấy người dùng này.');
    }

    const { fullName, phone, role, isActive } = req.body;

    if (!fullName || !fullName.trim()) {
      req.flash('danger', 'Họ và tên không được để trống.');
      return res.redirect(`/admin/users/${user.id}`);
    }

    const isSelf = user.id === req.session.user.id;
    const validRoles = ['customer', 'staff', 'admin'];
    const newRole = isSelf ? user.role : validRoles.includes(role) ? role : user.role;
    const newStatus = isSelf ? user.is_active : isActive === '1';

    await User.update(user.id, {
      full_name: fullName.trim(),
      phone: phone ? phone.trim() : null,
      role: newRole,
      is_active: newStatus,
    });

    req.flash('success', 'Đã cập nhật thông tin người dùng thành công.');
    return res.redirect('/admin/users');
  },

  async toggleStatus(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError(404, 'Không tìm thấy người dùng này.');
    }

    if (user.id === req.session.user.id) {
      req.flash('danger', 'Không thể tự khóa tài khoản của chính mình.');
      return res.redirect('/admin/users');
    }

    const newStatus = !user.is_active;
    await User.update(user.id, { is_active: newStatus });

    req.flash('success', `Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${user.email}.`);
    return res.redirect('/admin/users');
  },
};
