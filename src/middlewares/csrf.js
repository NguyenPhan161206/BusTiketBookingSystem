/**
 * Chống CSRF (Synchronised Token Pattern) cho mọi request POST/PUT/PATCH/DELETE.
 * Token được lấy theo thứ tự:
 *   1. Header  X-CSRF-Token      (AJAX - public/js/app.js tự gắn)
 *   2. Body    _csrf             (form thường: <input type="hidden" name="_csrf" value="{{csrfToken}}">)
 *   3. Query   ?_csrf=...        (form multipart/upload)
 * Sau khi đăng nhập / regenerate session, gọi req.csrfToken(true) để cấp token mới.
 */
const { csrfSync } = require('csrf-sync');

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] || (req.body && req.body._csrf) || (req.query && req.query._csrf),
});

module.exports = csrfSynchronisedProtection;
