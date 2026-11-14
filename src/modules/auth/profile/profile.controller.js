const User = require('../users/users.model');
const { hashPassword, verifyPassword } = require('../utils/password');
const db = require('../../../db/knex');

module.exports = {
  async showProfile(req, res) {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash('danger', 'Không tìm thấy thông tin tài khoản.');
      return res.redirect('/auth/login');
    }

    return res.render('auth/profile/profile', {
      title: 'Hồ sơ cá nhân',
      user,
    });
  },

  async updateProfile(req, res) {
    const { fullName, phone } = req.body;
    if (!fullName || !fullName.trim()) {
      req.flash('danger', 'Họ và tên không được để trống.');
      return res.redirect('/account/profile');
    }

    await User.update(req.session.user.id, {
      full_name: fullName.trim(),
      phone: phone ? phone.trim() : null,
    });

    req.session.user.fullName = fullName.trim();

    req.flash('success', 'Cập nhật thông tin tài khoản thành công.');
    return res.redirect('/account/profile');
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash('danger', 'Vui lòng điền đầy đủ các thông tin đổi mật khẩu.');
      return res.redirect('/account/profile');
    }

    if (newPassword.length < 6) {
      req.flash('danger', 'Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return res.redirect('/account/profile');
    }

    if (newPassword !== confirmPassword) {
      req.flash('danger', 'Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return res.redirect('/account/profile');
    }

    const user = await User.findById(req.session.user.id);
    if (!user || !verifyPassword(currentPassword, user.password_hash)) {
      req.flash('danger', 'Mật khẩu hiện tại không chính xác.');
      return res.redirect('/account/profile');
    }

    const newHash = hashPassword(newPassword);
    await User.update(user.id, {
      password_hash: newHash,
    });

    req.flash('success', 'Đổi mật khẩu thành công.');
    return res.redirect('/account/profile');
  },

  async bookingHistory(req, res) {
    let bookings = [];

    // Kiểm tra xem bảng bookings (do TV4 phụ trách) đã tồn tại hay chưa
    try {
      const hasTable = await db.schema.hasTable('bookings');
      if (hasTable) {
        bookings = await db('bookings')
          .where({ user_id: req.session.user.id })
          .orderBy('created_at', 'desc');
      }
    } catch {
      bookings = [];
    }

    return res.render('auth/profile/history', {
      title: 'Lịch sử đặt vé',
      bookings,
    });
  },
};
