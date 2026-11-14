/**
 * Tạo middleware upload (multer) lưu file vào public/uploads/<folder>.
 *
 *   const { createUploader } = require('../../../config/upload');
 *   const upload = createUploader({ folder: 'news' });
 *   router.post('/admin/news', upload.single('thumbnail'), controller.create);
 *   // trong controller: req.file.publicPath === '/uploads/news/<uuid>.jpg'
 *
 * Lưu ý CSRF với form multipart: đặt token trên URL action, ví dụ
 *   <form method="post" enctype="multipart/form-data" action="/admin/news?_csrf={{csrfToken}}">
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const createError = require('http-errors');
const config = require('./env');

const UPLOAD_ROOT = path.resolve(__dirname, '../../public/uploads');
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function createUploader({ folder = 'misc', allowedTypes = IMAGE_TYPES, maxSizeMB } = {}) {
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '') || 'misc';
  const destination = path.join(UPLOAD_ROOT, safeFolder);
  fs.mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  const uploader = multer({
    storage,
    limits: { fileSize: (maxSizeMB || config.upload.maxSizeMB) * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) return cb(null, true);
      return cb(createError(400, 'Định dạng file không được hỗ trợ.'));
    },
  });

  // Chuẩn hóa lỗi multer và gắn đường dẫn public cho file đã upload
  const wrap = (middleware) => (req, res, next) =>
    middleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(createError(400, `Lỗi upload: ${err.message}`));
      }
      if (err) return next(err);
      const files = req.file ? [req.file] : Object.values(req.files || {}).flat();
      files.forEach((f) => {
        f.publicPath = `/uploads/${safeFolder}/${f.filename}`;
      });
      return next();
    });

  return {
    single: (field) => wrap(uploader.single(field)),
    array: (field, maxCount) => wrap(uploader.array(field, maxCount)),
    fields: (fields) => wrap(uploader.fields(fields)),
  };
}

module.exports = { createUploader, IMAGE_TYPES, UPLOAD_ROOT };
