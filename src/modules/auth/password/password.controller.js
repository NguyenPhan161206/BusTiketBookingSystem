const User = require('../users/users.model');
const { hashPassword, generateToken } = require('../utils/password');
const { sendMail } = require('../../../config/mailer');
const config = require('../../../config/env');
const logger = require('../../../utils/logger');

module.exports = {
  showForgotPassword(req, res) {
    res.render('auth/password/forgot', {
      title: 'Quên mật khẩu',
      values: {},
    });
  },

  async handleForgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      req.flash('danger', 'Vui lòng nhập địa chỉ email của bạn.');
      return res.render('auth/password/forgot', {
        title: 'Quên mật khẩu',
        values: {},
      });
    }

    const user = await User.findByEmail(email);
    if (user && user.is_active) {
      const resetToken = generateToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

      await User.update(user.id, {
        password_reset_token: resetToken,
        password_reset_expires_at: expiresAt,
      });

      const resetUrl = `${config.appUrl}/auth/reset-password?token=${resetToken}`;

      try {
        await sendMail({
          to: user.email,
          subject: '[Bus Ticket] Yêu cầu đặt lại mật khẩu',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0d6efd; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
              <p>Xin chào <strong>${user.full_name}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>${config.appUrl}</strong>.</p>
              <p>Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới (liên kết này có hiệu lực trong vòng 60 phút):</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
              </p>
              <p style="color: #64748b; font-size: 14px;">Hoặc dán liên kết sau vào trình duyệt:<br>
                <a href="${resetUrl}" style="color: #0d6efd; word-break: break-all;">${resetUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Nếu bạn không yêu cầu điều này, xin hãy yên tâm rằng tài khoản của bạn vẫn an toàn và bỏ qua email này.</p>
            </div>
          `,
        });
      } catch (err) {
        logger.error(`Lỗi khi gửi email đặt lại mật khẩu: ${err.message}`);
      }
    }

    req.flash(
      'info',
      'Nếu địa chỉ email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư của bạn.',
    );
    return res.redirect('/auth/login');
  },

  async showResetPassword(req, res) {
    const { token } = req.query;
    if (!token) {
      req.flash('danger', 'Mã đặt lại mật khẩu không hợp lệ.');
      return res.redirect('/auth/forgot-password');
    }

    const user = await User.findByResetToken(token);
    if (!user) {
      req.flash('danger', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return res.redirect('/auth/forgot-password');
    }

    return res.render('auth/password/reset', {
      title: 'Đặt lại mật khẩu',
      token,
    });
  },

  async handleResetPassword(req, res) {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      req.flash('danger', 'Mã đặt lại mật khẩu không hợp lệ.');
      return res.redirect('/auth/forgot-password');
    }

    if (!password || !confirmPassword) {
      req.flash('danger', 'Vui lòng nhập đầy đủ thông tin mật khẩu mới.');
      return res.render('auth/password/reset', {
        title: 'Đặt lại mật khẩu',
        token,
      });
    }

    if (password.length < 6) {
      req.flash('danger', 'Mật khẩu phải có tối thiểu 6 ký tự.');
      return res.render('auth/password/reset', {
        title: 'Đặt lại mật khẩu',
        token,
      });
    }

    if (password !== confirmPassword) {
      req.flash('danger', 'Mật khẩu xác nhận không khớp.');
      return res.render('auth/password/reset', {
        title: 'Đặt lại mật khẩu',
        token,
      });
    }

    const user = await User.findByResetToken(token);
    if (!user) {
      req.flash('danger', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return res.redirect('/auth/forgot-password');
    }

    const passwordHash = hashPassword(password);
    await User.update(user.id, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires_at: null,
    });

    req.flash(
      'success',
      'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    );
    return res.redirect('/auth/login');
  },
};
