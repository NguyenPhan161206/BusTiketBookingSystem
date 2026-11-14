# Quy ước phát triển

Tài liệu này là "luật chơi" chung để 5 thành viên phát triển song song mà không giẫm chân nhau.
Base (hạ tầng) đã dựng sẵn; mỗi người chỉ làm trong phạm vi module của mình.

## 1. Phân chia sở hữu

| Thành viên | Module (toàn bộ code, view, migration, seed) | Phần dùng chung được giao                                     |
| ---------- | -------------------------------------------- | ------------------------------------------------------------- |
| TV1        | `src/modules/auth`                           | `src/middlewares/auth.js` (requireAuth, requireRole), bảo mật |
| TV2        | `src/modules/catalog`                        | `layouts/admin.hbs`, `layouts/static.hbs`                     |
| TV3        | `src/modules/trips`                          | `layouts/customer.hbs`, trang chủ `/`                         |
| TV4        | `src/modules/bookings`                       | Điều phối schema dữ liệu dùng chung                           |
| TV5        | `src/modules/operations`                     | Docker production, kiểm thử tích hợp                          |

Mỗi người chỉ sửa trong thư mục module của mình.

**File base dùng chung** (`src/app.js`, `src/config/*`, `src/helpers/*`, `src/utils/*`, `src/middlewares/*` trừ `auth.js`,
`partials/*`, `docker-compose.yml`, `package.json`): muốn sửa thì tạo PR riêng, mô tả rõ lý do và báo cả nhóm.

## 2. Git

- Nhánh chính: `main` (bản demo ổn định) ← `develop` (tích hợp) ← nhánh tính năng.
- Đặt tên nhánh: `feature/<module>-<mô-tả>`, `fix/<module>-<mô-tả>`. Ví dụ: `feature/bookings-seat-hold`.
- Commit theo Conventional Commits: `feat(trips): tìm chuyến theo ngày`, `fix(auth): ...`, `chore: ...`, `docs: ...`.
- Mở Pull Request vào `develop`, cần ít nhất 1 người review. Trước khi mở PR:
  `npm run lint && npm run format:check` phải sạch, và `git pull origin develop` để giải quyết xung đột.
- Không commit `.env`, `node_modules`, file trong `public/uploads`.
- Thêm thư viện mới (`npm install x`): commit cả `package.json` và `package-lock.json`, ghi rõ trong PR.

## 3. Cấu trúc thư mục: Feature-based + MVC

Thư mục chia **theo chức năng** (module → feature); bên trong mỗi feature tách lớp theo **MVC**.

```
src/modules/<module>/                 # vd: catalog (TV2)
├── routes.js                         # gom router của các feature con (được mount tự động)
├── migrations/                       # migration của module
├── seeds/                            # seed của module
└── <feature>/                        # vd: stations
    ├── <feature>.routes.js           # Routing: URL + middleware, KHÔNG viết logic
    ├── <feature>.controller.js       # C: nhận req, validate, gọi model/service, render view hoặc trả JSON
    ├── <feature>.model.js            # M: truy vấn CSDL bằng Knex, KHÔNG dùng req/res
    ├── <feature>.service.js          # (tùy chọn) nghiệp vụ phức tạp dùng nhiều model, vd. giữ ghế, hủy vé
    └── *.hbs                         # V: view của feature
```

| Lớp        | File                         | Được làm                                        | Không được làm                   |
| ---------- | ---------------------------- | ----------------------------------------------- | -------------------------------- |
| Routing    | `*.routes.js`                | Khai báo URL, gắn middleware (auth, upload)     | Viết logic                       |
| Controller | `*.controller.js`            | Đọc `req`, validate, chọn view / JSON           | Viết SQL/Knex                    |
| Service    | `*.service.js` (chỉ khi cần) | Gộp nhiều model, transaction, quy tắc nghiệp vụ | Dùng `req`/`res`                 |
| Model      | `*.model.js`                 | Truy vấn Knex cho bảng của feature              | Dùng `req`/`res`, render         |
| View       | `*.hbs`                      | Hiển thị dữ liệu controller truyền vào          | Truy vấn dữ liệu, logic phức tạp |

- Feature CRUD đơn giản: controller gọi thẳng model. Chỉ thêm service khi nghiệp vụ phức tạp.
- Feature dùng dữ liệu của module khác: gọi **model của feature đó** (vd. `require('../../trips/trips/trips.model')`),
  không tự viết truy vấn vào bảng của người khác. Cần hàm mới thì nhờ chủ module thêm.
- `src/modules/index.js` tự động mount `routes.js` của mọi module tại `/` - khai báo đường dẫn đầy đủ.
- Tên thư mục/file: chữ thường, gạch ngang (`seat-hold/seat-hold.model.js`).

Ví dụ hoàn chỉnh (feature `stations` của module `catalog`):

```js
// src/modules/catalog/routes.js - gom feature con
const router = require('express').Router();
router.use(require('./stations/stations.routes'));
module.exports = router;

// src/modules/catalog/stations/stations.routes.js
const router = require('express').Router();
const controller = require('./stations.controller');
const { requireRole } = require('../../../middlewares/auth');

router.get('/admin/stations', requireRole('admin'), controller.list);
router.post('/admin/stations', requireRole('admin'), controller.create);
module.exports = router;

// src/modules/catalog/stations/stations.controller.js
const createError = require('http-errors');
const Station = require('./stations.model');
const { parsePageParams } = require('../../../utils/paginate');

module.exports = {
  async list(req, res) {
    const { data, pagination } = await Station.list(parsePageParams(req.query));
    res.render('catalog/stations/list', {
      layout: 'admin',
      title: 'Bến xe',
      stations: data,
      pagination,
    });
  },
  async create(req, res) {
    if (!req.body.name) throw createError(422, 'Tên bến xe là bắt buộc');
    await Station.create(req.body);
    req.flash('success', 'Đã thêm bến xe');
    res.redirect('/admin/stations');
  },
};

// src/modules/catalog/stations/stations.model.js
const db = require('../../../db/knex');
const { paginate } = require('../../../utils/paginate');

module.exports = {
  list: ({ page, perPage }) => paginate(db('stations').orderBy('name'), { page, perPage }),
  findById: (id) => db('stations').where({ id }).first(),
  create: ({ name, address }) => db('stations').insert({ name, address }).returning('*'),
};
```

```hbs
{{! src/modules/catalog/stations/list.hbs }}
<h1 class='h4'>Bến xe</h1>
<ul>{{#each stations}}<li>{{name}}</li>{{/each}}</ul>
{{> pagination pagination=pagination}}
```

Express 5 tự bắt lỗi của hàm `async` - **không cần try/catch**, chỉ cần `throw createError(status, message)`.
Đường dẫn import từ trong feature tới hạ tầng base là `../../../` (vd. `../../../db/knex`).

## 4. Quy ước URL

| Tiền tố      | Dùng cho                               | Layout                |
| ------------ | -------------------------------------- | --------------------- |
| `/admin/...` | Trang quản trị (admin)                 | `admin`               |
| `/staff/...` | Trang nhân viên soát vé                | `admin`               |
| `/api/...`   | Endpoint AJAX trả JSON                 | -                     |
| `/pages/...` | Trang tĩnh (giới thiệu, chính sách...) | `static`              |
| còn lại      | Trang khách hàng                       | `customer` (mặc định) |

URL dùng chữ thường, gạch ngang, danh từ số nhiều: `/admin/bus-types`, `/api/trips/:id/seats`.
Đường dẫn gợi ý cho từng module ghi ở đầu mỗi `routes.js`. Trước khi dùng một tiền tố mới, kiểm tra không trùng module khác.

## 5. JSON / AJAX

Mọi endpoint `/api/*` trả về đúng định dạng:

```json
{ "success": true, "data": { }, "message": null }
{ "success": false, "data": null, "message": "Ghế đã có người giữ", "errors": { "seat": "..." } }
```

```js
const { ok, fail } = require('../../utils/apiResponse');
return ok(res, seats); // 200
return ok(res, booking, 'Đã tạo', 201);
return fail(res, 'Ghế đã có người giữ', 409);
```

Phía trình duyệt dùng `window.api()` (trong `public/js/app.js`, tự gắn CSRF token):

```js
const res = await api('/api/seats/hold', { method: 'POST', body: { tripId: 1, seatIds: [3, 4] } });
if (!res.success) alert(res.message);
```

Viết tài liệu Swagger ngay trên route (hiển thị tại `/api-docs`):

```js
/**
 * @openapi
 * /api/trips/search:
 *   get:
 *     tags: [Trips]
 *     summary: Tìm chuyến xe
 *     parameters:
 *       - { in: query, name: from, schema: { type: integer } }
 *     responses:
 *       200: { description: Danh sách chuyến }
 */
router.get('/api/trips/search', controller.search);
```

## 6. View (Handlebars)

- Render theo đường dẫn trong `src/modules`: `res.render('<module>/<feature>/<view>', { title, layout: 'admin' | 'static' })`
  - mặc định layout `customer`. View dùng chung (`layouts`, `partials`, `errors`) nằm ở `src/views`.
- Biến luôn có sẵn trong view: `currentUser`, `csrfToken`, `currentPath`, `currentQuery`, `flashMessages`, `appName`, `year`.
- `{{biến}}` tự escape HTML (chống XSS). Chỉ dùng `{{{biến}}}` cho HTML **đã được làm sạch** (vd. nội dung WYSIWYG đã sanitize).
- **Section** - chèn CSS/JS riêng của trang vào layout:
  ```hbs
  {{#section 'head'}}<link rel='stylesheet' href='/css/bookings-seat-map.css' />{{/section}}
  {{#section 'scripts'}}<script src='/js/bookings-seat-map.js'></script>{{/section}}
  ```
- **Không viết `<script>` inline hay `onclick="..."`** - bị Content-Security-Policy chặn. Đặt JS vào `public/js/<module>-<trang>.js`.
- Partial có sẵn: `{{> flash}}` (layout đã gọi), `{{> pagination pagination=pagination}}`.
- Helper có sẵn: `eq neq gt lt and or not`, `formatCurrency`, `formatDate d "date|time|datetime"`, `range`, `pageUrl`, `activeIf`.
  Thêm helper mới vào `src/helpers/handlebars.js` (PR riêng).
- Đặt tên file view/CSS/JS: chữ thường, gạch ngang: `trip-detail.hbs`, `trips-search.js`.
- Trang dùng Bootstrap không dùng class Tailwind và ngược lại. View trang tĩnh (Tailwind) đặt trong thư mục
  tên **`static-pages`** của module (vd. `src/modules/catalog/static-pages/about.hbs`, render với `layout: 'static'`) -
  Tailwind chỉ quét thư mục này. Chạy `npm run watch:css` khi phát triển.

## 7. Form, CSRF, flash

```hbs
<form method="post" action="/admin/stations">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  ...
</form>

{{!-- Form upload (multipart): token đặt trên URL --}}
<form method="post" enctype="multipart/form-data" action="/admin/news?_csrf={{csrfToken}}">
```

- Sau POST thành công: `req.flash('success' | 'danger' | 'warning' | 'info', 'Nội dung')` rồi `res.redirect(...)`.
- Sau khi đăng nhập / `req.session.regenerate()`: gọi `req.csrfToken(true)` để cấp token mới (TV1).

## 8. Xác thực & phân quyền (hợp đồng chung)

- Khi đăng nhập, TV1 đặt: `req.session.user = { id, fullName, email, role }`, `role ∈ customer | staff | admin`.
- Các module khác chỉ đọc `req.session.user` (server) hoặc `currentUser` (view).
- Bảo vệ route bằng `requireAuth` và `requireRole('admin')`, `requireRole('staff', 'admin')` từ `src/middlewares/auth.js`.
  Hiện là **stub cho qua tất cả** - cứ gắn vào route ngay, khi TV1 hoàn thiện sẽ tự có hiệu lực.

## 9. CSDL: migration & seed

- Migration và seed nằm trong module: `src/modules/<module>/migrations/`, `src/modules/<module>/seeds/`.
  Knex gộp tất cả thư mục và chạy theo **thứ tự tên file** trên toàn hệ thống.
- Không sửa CSDL bằng tay; mọi thay đổi schema qua migration, tạo bằng lệnh (tự đặt vào đúng module):
  ```bash
  npm run migrate:make -- catalog create_stations_table
  # -> src/modules/catalog/migrations/20261115083000_create_stations_table.js
  ```
- Bảng có khóa ngoại tới bảng của module khác: migration của bạn phải có timestamp **sau** migration tạo bảng kia
  (cứ tạo file sau khi bảng kia đã được merge là đúng).
- **Không sửa migration đã merge** - tạo migration mới để thay đổi.
- Bảng dùng chung nhiều module (vd. `trips`, `bookings`, `seats`): thống nhất schema với TV4 trước khi tạo.
- Quy ước đề xuất: tên bảng/cột `snake_case`, bảng số nhiều; khóa chính `id`; khóa ngoại `<bảng_số_ít>_id`;
  thời gian dùng `timestamptz` (`t.timestamps(true, true)`); tiền VND dùng `integer`/`bigint`; trạng thái dùng chuỗi
  đúng như sơ đồ vòng đời (`draft`, `active`, `pending`, `paid`, ...).
- Seed: `npm run seed:make -- <module> NN_<module>_<mô_tả>` (vd. `npm run seed:make -- catalog 20_catalog_stations`),
  `NN` quyết định thứ tự chạy, đề xuất: `01-19` TV1, `20-39` TV2,
  `40-59` TV3, `60-79` TV4, `80-99` TV5. Seed phải **idempotent** (xóa/ghi đè dữ liệu của mình trước khi insert)
  vì container chạy seed mỗi lần khởi động.

## 10. Tiện ích dùng chung

| Cần gì        | Dùng                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Truy vấn CSDL | `const db = require('../../../db/knex')` (từ trong feature)                                         |
| Phân trang    | `paginate(query, { page, perPage })`, `parsePageParams(req.query)` - `utils/paginate.js`            |
| Trả JSON      | `ok`, `fail` - `utils/apiResponse.js`                                                               |
| Upload file   | `createUploader({ folder: 'news' }).single('image')` → `req.file.publicPath`                        |
| Gửi email     | `await sendMail({ to, subject, html })` - `config/mailer.js` (dev: xem ở Mailpit)                   |
| Báo lỗi       | `throw createError(404, 'Không tìm thấy...')` (`http-errors`)                                       |
| Ghi log       | `logger.info/warn/error` - `utils/logger.js`                                                        |
| Cấu hình      | `require('../../config/env')` - không đọc `process.env` trực tiếp; biến mới thêm vào `.env.example` |

### Ô gợi ý khi gõ: Algolia Autocomplete

Base đã cài [Algolia Autocomplete](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/)
(mã nguồn mở MIT). **Không cần tài khoản Algolia**: dữ liệu lấy từ API của chính hệ thống qua `getItems()`.
Không dùng `getAlgoliaResults` / `@algolia/client-search` (cần tài khoản và dịch vụ trả phí của Algolia).

Chỉ nạp ở trang cần dùng:

```hbs
{{#section 'head'}}
  <link rel='stylesheet' href='/vendor/algolia-autocomplete-theme/theme.min.css' />
{{/section}}

<div id='departure'></div>

{{#section 'scripts'}}
  <script src='/vendor/algolia-autocomplete/index.production.js'></script>
  <script src='/js/trips-search.js'></script>
{{/section}}
```

```js
// public/js/trips-search.js
(function () {
  var autocomplete = window['@algolia/autocomplete-js'].autocomplete;

  autocomplete({
    container: '#departure',
    placeholder: 'Điểm đi',
    getSources: function () {
      return [
        {
          sourceId: 'locations',
          getItems: async function (params) {
            // API do module sở hữu dữ liệu viết, trả về chuẩn { success, data, message }
            var res = await api('/api/locations?q=' + encodeURIComponent(params.query));
            return res.success ? res.data : [];
          },
          getItemInputValue: function (params) {
            return params.item.name;
          },
          templates: {
            item: function (params) {
              return params.item.name;
            },
          },
        },
      ];
    },
  });
})();
```

Trong `templates`, nên trả về chuỗi hoặc dùng `params.html` (đã escape) - không tự ghép HTML từ dữ liệu người dùng.

## 11. Bảo mật tối thiểu (mọi người)

- Luôn dùng Knex builder hoặc binding (`db.raw('... where id = ?', [id])`) - **không nối chuỗi SQL**.
- Kiểm tra dữ liệu đầu vào ở server, kể cả khi đã validate phía client.
- Kiểm tra quyền sở hữu dữ liệu (vd. khách chỉ xem được booking của mình), không chỉ dựa vào việc ẩn nút.
- CSP chỉ cho tài nguyên cùng origin. Cần dùng dịch vụ ngoài (API chatbot, CDN...) thì sửa `directives` trong
  `src/app.js` qua PR riêng.
