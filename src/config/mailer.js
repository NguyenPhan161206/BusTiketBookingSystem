/**
 * Gửi email dùng chung (xác thực tài khoản, vé điện tử...).
 *   const { sendMail } = require('../../../config/mailer');
 *   await sendMail({ to, subject, html, text, attachments });
 * Dev: xem email tại Mailpit http://localhost:8025
 */
const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.password } : undefined,
});

async function sendMail({ to, subject, html, text, attachments }) {
  const info = await transporter.sendMail({
    from: config.mail.from,
    to,
    subject,
    html,
    text,
    attachments,
  });
  logger.info(`Mail sent to ${to}: ${subject}`);
  return info;
}

module.exports = { transporter, sendMail };
