/**
 * Flash message lưu qua session, hiển thị ở lần render kế tiếp (sau redirect).
 *   req.flash('success', 'Lưu thành công');   // type: success | danger | warning | info
 *   res.redirect('/admin/stations');
 * Layout tự hiển thị qua partial `flash`.
 */
module.exports = function flash(req, res, next) {
  req.flash = (type, message) => {
    if (!req.session) return;
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type, message });
  };

  res.locals.flashMessages = (req.session && req.session.flash) || [];
  if (req.session && req.session.flash) delete req.session.flash;

  next();
};
