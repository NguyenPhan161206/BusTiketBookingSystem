/**
 * Helper Handlebars dùng chung. Thêm helper mới ở đây (báo nhóm trước khi sửa helper có sẵn).
 */
const TIMEZONE = 'Asia/Ho_Chi_Minh';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TIMEZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

module.exports = {
  /**
   * Cơ chế Section: view con đẩy nội dung vào vị trí đặt sẵn trong layout.
   *   View:   {{#section "scripts"}}<script src="/js/seat-map.js"></script>{{/section}}
   *   Layout: {{{_sections.scripts}}}
   * Các section có sẵn trong layout: head (CSS riêng), scripts (JS riêng).
   */
  section(name, options) {
    const root = options.data.root;
    root._sections = root._sections || {};
    root._sections[name] = (root._sections[name] || '') + options.fn(this);
    return null;
  },

  /** {{#if (eq status "active")}} ... {{/if}} */
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  and: (...args) => args.slice(0, -1).every(Boolean),
  or: (...args) => args.slice(0, -1).some(Boolean),
  not: (value) => !value,

  /** {{formatCurrency 350000}} -> 350.000 ₫ */
  formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '';
    return currencyFormatter.format(Number(value));
  },

  /** {{formatDate trip.departure_at}} -> 14/11/2026 ; {{formatDate d "datetime"}} -> 14/11/2026 08:30 */
  formatDate(value, format) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const mode = typeof format === 'string' ? format : 'date';
    const datePart = dateFormatter.format(date);
    const timePart = timeFormatter.format(date);
    if (mode === 'time') return timePart;
    if (mode === 'datetime') return `${datePart} ${timePart}`;
    return datePart;
  },

  /** {{#each (range 1 5)}}{{this}}{{/each}} -> 1 2 3 4 5 */
  range(from, to) {
    const result = [];
    for (let i = Number(from); i <= Number(to); i += 1) result.push(i);
    return result;
  },

  /**
   * Tạo URL cho trang `page`, giữ nguyên các query hiện tại (bộ lọc, sắp xếp).
   *   <a href="{{pageUrl 3}}">3</a>
   */
  pageUrl(page, options) {
    const root = options.data.root;
    const params = new URLSearchParams(root.currentQuery || {});
    params.set('page', page);
    return `${root.currentPath || ''}?${params.toString()}`;
  },

  /** Đánh dấu menu đang active: class="nav-link {{activeIf '/admin/stations'}}" */
  activeIf(prefix, options) {
    const current = options.data.root.currentPath || '';
    return current === prefix || current.startsWith(`${prefix}/`) ? 'active' : '';
  },
};
