const User = require('../users/users.model');
const { verifyPassword } = require('../utils/password');

module.exports = {
  showLoginForm(req, res) {
    res.render('auth/login/login', {
      title: 'Đăng nhập',
      values: {},
    });
  },

  async handleLogin(req, res) {
    const { email, password } = req.body;
    const values = { email };

    if (!email || !password) {
      req.flash('danger', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return res.render('auth/login/login', {
        title: 'Đăng nhập',
        values,
      });
    }

    const user = await User.findByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      req.flash('danger', 'Email hoặc mật khẩu không chính xác.');
      return res.render('auth/login/login', {
        title: 'Đăng nhập',
        values,
      });
    }

    if (!user.is_active) {
      req.flash(
        'danger',
        'Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa. Vui lòng liên hệ quản trị viên.',
      );
      return res.render('auth/login/login', {
        title: 'Đăng nhập',
        values,
      });
    }

    if (!user.email_verified_at) {
      req.flash(
        'warning',
        'Tài khoản của bạn chưa được xác thực email. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.',
      );
      return res.render('auth/login/login', {
        title: 'Đăng nhập',
        values,
      });
    }

    const returnTo = req.session.returnTo;

    return req.session.regenerate((err) => {
      if (err) {
        req.flash('danger', 'Đã xảy ra lỗi khi tạo phiên đăng nhập.');
        return res.redirect('/auth/login');
      }

      req.session.user = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      };

      if (typeof req.csrfToken === 'function') {
        req.csrfToken(true);
      }

      req.flash('success', `Chào mừng trở lại, ${user.full_name}!`);

      if (returnTo) {
        return res.redirect(returnTo);
      }

      if (user.role === 'admin') {
        return res.redirect('/admin');
      }

      if (user.role === 'staff') {
        return res.redirect('/staff');
      }

      return res.redirect('/');
    });
  },

  handleLogout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('bts.sid');
      res.redirect('/');
    });
  },
};
