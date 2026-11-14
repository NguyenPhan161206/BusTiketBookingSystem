/**
 * Chuẩn JSON trả về cho mọi endpoint AJAX / API:
 *   { success: boolean, data: any, message: string|null, errors?: object }
 *
 *   const { ok, fail } = require('../../../utils/apiResponse');
 *   return ok(res, trips);
 *   return ok(res, booking, 'Đặt vé thành công', 201);
 *   return fail(res, 'Ghế đã có người giữ', 409);
 *   return fail(res, 'Dữ liệu không hợp lệ', 422, { phone: 'Số điện thoại sai định dạng' });
 */
function ok(res, data = null, message = null, status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function fail(res, message = 'Có lỗi xảy ra', status = 400, errors = undefined) {
  const body = { success: false, data: null, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
}

module.exports = { ok, fail };
