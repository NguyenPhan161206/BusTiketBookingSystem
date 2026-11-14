const crypto = require('node:crypto');

/**
 * Băm mật khẩu an toàn bằng Scrypt (chuẩn cryptographic tích hợp sẵn trong Node.js, không phụ thuộc thư viện ngoài).
 * Format lưu: salt:derivedKey
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * So sánh mật khẩu đầu vào với chuỗi băm lưu trữ.
 * Dùng timingSafeEqual để chống tấn công Timing Attack.
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedKey.length) {
    return false;
  }
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Tạo token ngẫu nhiên bảo mật cao (URL-safe) cho xác thực email & đặt lại mật khẩu.
 */
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
};
