/**
 * Khởi tạo Express app. Thứ tự middleware quan trọng - đọc kỹ trước khi sửa.
 */
const path = require('node:path');
const express = require('express');
const { engine } = require('express-handlebars');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const sessionMiddleware = require('./config/session');
const swaggerSpec = require('./config/swagger');
const helpers = require('./helpers/handlebars');
const csrfProtection = require('./middlewares/csrf');
const flash = require('./middlewares/flash');
const locals = require('./middlewares/locals');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const systemRoutes = require('./routes/system');
const mountModules = require('./modules');

const app = express();
const ROOT = path.resolve(__dirname, '..');

// ---------- View engine: Handlebars ----------
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'customer',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers,
  }),
);
app.set('view engine', 'hbs');
// Tìm view ở 2 nơi: view dùng chung (src/views) và view nằm trong feature (src/modules).
//   res.render('errors/404')               -> src/views/errors/404.hbs
//   res.render('catalog/stations/list')    -> src/modules/catalog/stations/list.hbs
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'modules')]);

if (config.isProduction) app.set('trust proxy', 1);

// ---------- Bảo mật HTTP headers ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Mặc định chỉ cho phép tài nguyên cùng origin. Thêm domain ngoài ở đây khi thật sự cần.
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: null,
      },
    },
  }),
);

app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// ---------- Static (không cần session) ----------
app.use(express.static(path.join(ROOT, 'public'), { maxAge: config.isProduction ? '7d' : 0 }));
app.use('/vendor/bootstrap', express.static(path.join(ROOT, 'node_modules/bootstrap/dist')));
// Algolia Autocomplete (MIT, không cần tài khoản Algolia) - chỉ nạp ở trang cần dùng, xem CONTRIBUTING.md
app.use(
  '/vendor/algolia-autocomplete',
  express.static(path.join(ROOT, 'node_modules/@algolia/autocomplete-js/dist/umd')),
);
app.use(
  '/vendor/algolia-autocomplete-theme',
  express.static(path.join(ROOT, 'node_modules/@algolia/autocomplete-theme-classic/dist')),
);

// ---------- Endpoint hệ thống (không cần session) ----------
app.use(systemRoutes.publicRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------- Body parser, rate limit, session, CSRF ----------
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.rateLimit.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(sessionMiddleware);
app.use(csrfProtection);
app.use(flash);
app.use(locals);

// ---------- Routes của các module (src/modules/*/routes.js) ----------
mountModules(app);

// ---------- Trang mặc định của base (module nào khai báo cùng path sẽ được ưu tiên) ----------
app.use(systemRoutes.fallbackRouter);

// ---------- 404 & lỗi ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
