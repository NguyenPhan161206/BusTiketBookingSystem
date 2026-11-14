/**
 * JavaScript dùng chung phía trình duyệt.
 *
 * window.api(url, options) - gọi AJAX, tự gắn CSRF token, parse JSON chuẩn { success, data, message }.
 *   const res = await api('/api/seats/hold', { method: 'POST', body: { tripId, seatIds } });
 *   if (res.success) { ... } else { alert(res.message); }
 *
 * Lưu ý CSP: không viết <script> inline trong view. Đặt JS vào public/js/<module>-<trang>.js
 * và nạp qua {{#section "scripts"}}<script src="/js/..."></script>{{/section}}
 */
(function () {
  'use strict';

  function getCsrfToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  async function api(url, options) {
    var opts = options || {};
    var headers = Object.assign(
      { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      opts.headers || {},
    );
    var body = opts.body;
    var method = (opts.method || 'GET').toUpperCase();

    if (method !== 'GET' && method !== 'HEAD') {
      headers['X-CSRF-Token'] = getCsrfToken();
    }
    if (body && !(body instanceof FormData) && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    try {
      var response = await fetch(url, {
        method: method,
        headers: headers,
        body: body,
        credentials: 'same-origin',
      });
      var json = await response.json().catch(function () {
        return { success: false, data: null, message: 'Phản hồi không hợp lệ từ máy chủ.' };
      });
      json.status = response.status;
      return json;
    } catch {
      return { success: false, data: null, message: 'Không thể kết nối máy chủ.', status: 0 };
    }
  }

  window.api = api;
  window.getCsrfToken = getCsrfToken;
})();
