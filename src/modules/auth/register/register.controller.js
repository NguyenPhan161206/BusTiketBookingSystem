const User = require('../users/users.model');
const { hashPassword, generateToken } = require('../utils/password');
const { sendMail } = require('../../../config/mailer');
const config = require('../../../config/env');
const logger = require('../../../utils/logger');

module.exports = {
  showRegisterForm(req, res) {
    res.render('auth/register/register', {
      title: 'Đăng ký tài khoản',
      values: {},
    });
  },

  async handleRegister(req, res) {
    const { fullName, email, phone, password, confirmPassword } = req.body;
    const values = { fullName, email, phone };

    if (!fullName || !email || !password || !confirmPassword) {
      req.flash('danger', 'Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return res.render('auth/register/register', {
        title: 'Đăng ký tài khoản',
        values,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('danger', 'Địa chỉ email không đúng định dạng.');
      return res.render('auth/register/register', {
        title: 'Đăng ký tài khoản',
        values,
      });
    }

    if (password.length < 6) {
      req.flash('danger', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return res.render('auth/register/register', {
        title: 'Đăng ký tài khoản',
        values,
      });
    }

    if (password !== confirmPassword) {
      req.flash('danger', 'Mật khẩu xác nhận không khớp.');
      return res.render('auth/register/register', {
        title: 'Đăng ký tài khoản',
        values,
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('danger', 'Email này đã được đăng ký trong hệ thống.');
      return res.render('auth/register/register', {
        title: 'Đăng ký tài khoản',
        values,
      });
    }

    const verificationToken = generateToken(32);
    const passwordHash = hashPassword(password);

    await User.create({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      password_hash: passwordHash,
      role: 'customer',
      is_active: true,
      email_verification_token: verificationToken,
      email_verified_at: null,
    });

    const verifyUrl = `${config.appUrl}/auth/verify-email?token=${verificationToken}`;

    try {
      await sendMail({
        to: email.trim(),
        subject: '[Bus Ticket] Xác thực tài khoản của bạn',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0d6efd; margin-top: 0;">Chào mừng bạn đến với Bus Ticket!</h2>
            <p>Xin chào <strong>${fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Để kích hoạt tài khoản và sử dụng đầy đủ các dịch vụ, vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a>
            </p>
            <p style="color: #64748b; font-size: 14px;">Hoặc dán liên kết sau vào trình duyệt của bạn:<br>
              <a href="${verifyUrl}" style="color: #0d6efd; word-break: break-all;">${verifyUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
    } catch (err) {
      logger.error(`Lỗi khi gửi email xác thực: ${err.message}`);
    }

    return res.render('auth/register/verify-notice', {
      title: 'Đăng ký thành công',
      email: email.trim(),
    });
  },

  async verifyEmail(req, res) {
    const { token } = req.query;
    if (!token) {
      req.flash('danger', 'Mã xác thực không hợp lệ.');
      return res.redirect('/auth/login');
    }

    const user = await User.findByVerificationToken(token);
    if (!user) {
      req.flash('danger', 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      return res.redirect('/auth/login');
    }

    await User.update(user.id, {
      email_verified_at: new Date(),
      email_verification_token: null,
    });

    req.flash('success', 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
    return res.redirect('/auth/login');
  },
};
