# Bus Ticket Booking System

Ứng dụng web đặt vé xe khách liên tỉnh - SSR với **Node.js + Express 5 + Handlebars + PostgreSQL (Knex)**.
Mô tả nghiệp vụ và phân công: [Bus-Ticket-Booking-System.md](Bus-Ticket-Booking-System.md).
Quy ước làm việc nhóm: **[CONTRIBUTING.md](CONTRIBUTING.md)** (bắt buộc đọc trước khi code).

## Công nghệ

| Hạng mục       | Công nghệ                                                 |
| -------------- | --------------------------------------------------------- |
| Runtime / Web  | Node.js ≥ 22.23.5, Express 5                              |
| View (SSR)     | express-handlebars (layout + partial + helper `section`)  |
| CSDL           | PostgreSQL 17, Knex (query builder, migration, seed)      |
| Session        | express-session lưu trong PostgreSQL (connect-pg-simple)  |
| Bảo mật nền    | helmet (HTTP headers/CSP), csrf-sync, express-rate-limit  |
| Upload / Email | multer, nodemailer (dev dùng Mailpit)                     |
| Tài liệu API   | swagger-jsdoc + swagger-ui-express tại `/api-docs`        |
| Giao diện      | Bootstrap 5 (ứng dụng chính), Tailwind CSS 4 (trang tĩnh) |
| Gợi ý khi gõ   | Algolia Autocomplete (MIT, không cần tài khoản Algolia)   |
| Công cụ        | nodemon, ESLint, Prettier, Docker Compose                 |

## Chạy bằng Docker (demo trên máy bất kỳ)

Yêu cầu: Docker Desktop.

```bash
docker compose up --build
```

| Dịch vụ             | Địa chỉ                        |
| ------------------- | ------------------------------ |
| Ứng dụng            | http://localhost:3101          |
| Tài liệu API        | http://localhost:3101/api-docs |
| Kiểm tra hệ thống   | http://localhost:3101/health   |
| Mailpit (xem email) | http://localhost:8026          |
| PostgreSQL (từ máy) | localhost:55433                |

Container app tự chạy: `migrate:latest` → seed (nếu `SEED_ON_START=true`) → start server.

Dừng: `docker compose down` · Xóa luôn dữ liệu DB: `docker compose down -v`.

**Trùng cổng?** Đổi cổng phía máy bằng biến môi trường (hoặc ghi vào `.env`):

```bash
APP_PORT=3100 DB_PORT_HOST=5433 docker compose up --build
```

**Lỗi `additional privileges requested: pass "--allow=fs.read=..."`** (Compose bản mới build qua bake): build image trước rồi chạy:

```bash
docker build -t bustiketbookingsystem-app .
docker compose up -d --no-build
```

## Chạy local để phát triển

Yêu cầu: Node.js ≥ 22.23.5 (khuyến nghị Node.js 24) và Docker Compose.

```bash
npm install
cp .env.example .env              # Windows PowerShell: Copy-Item .env.example .env
docker compose up -d db mailpit   # chỉ chạy PostgreSQL + Mailpit
npm run migrate && npm run seed
npm run dev                       # http://localhost:3101, tự reload khi sửa code
```

Nếu đã đổi `DB_PORT_HOST` cho container DB thì sửa `DB_PORT` trong `.env` cho khớp.

**Nếu cổng 5432, 8025 hoặc 1025 đang được dùng**, đổi các cổng host trong `.env`:

```dotenv
DB_PORT=55433
DB_PORT_HOST=55433
SMTP_PORT=1026
MAILPIT_UI_PORT=8026
MAILPIT_SMTP_PORT=1026
```

Sau đó chạy PostgreSQL và Mailpit bằng một Compose project riêng. Project riêng tạo volume DB riêng, tránh dùng nhầm dữ liệu/mật khẩu từ một container cũ mà không cần xóa volume hiện tại:

```bash
docker compose -p busticket-qnhu up -d db mailpit
npm run migrate && npm run seed && npm run dev
```

Nếu `migrate` hoặc `seed` báo lỗi, không chạy tiếp `npm run dev`; sửa kết nối DB trước. Dùng `docker compose -p busticket-qnhu logs db` để xem log PostgreSQL.

## Scripts

| Lệnh                                     | Tác dụng                                       |
| ---------------------------------------- | ---------------------------------------------- |
| `npm run dev`                            | Build Tailwind + chạy server với nodemon       |
| `npm start`                              | Chạy server (production)                       |
| `npm run watch:css`                      | Build lại Tailwind khi sửa trang tĩnh          |
| `npm run migrate`                        | Chạy migration mới                             |
| `npm run migrate:make -- <module> <tên>` | Tạo file migration trong module                |
| `npm run migrate:rollback`               | Rollback batch migration gần nhất              |
| `npm run migrate:status`                 | Xem trạng thái migration                       |
| `npm run seed`                           | Chạy toàn bộ seed                              |
| `npm run seed:make -- <module> <tên>`    | Tạo file seed trong module                     |
| `npm run lint` / `lint:fix`              | Kiểm tra / sửa lỗi ESLint                      |
| `npm run format` / `format:check`        | Định dạng / kiểm tra định dạng code (Prettier) |

## Cấu trúc thư mục

```
├── docker-compose.yml, Dockerfile, knexfile.js, .env.example
├── scripts/                        # seed-on-start.js, make-db-file.js (tạo migration/seed theo module)
├── public/                         # file tĩnh: css/, js/app.js (helper AJAX), img/, uploads/
└── src/
    ├── app.js, server.js           # khởi tạo Express, thứ tự middleware
    ├── config/                     # env, database, session, mailer, upload, swagger
    ├── db/                         # knex.js, migrations/ + seeds/ của base
    ├── helpers/handlebars.js       # section, eq, formatCurrency, formatDate, pageUrl, ...
    ├── middlewares/                # csrf, flash, locals, errorHandler, auth (stub - TV1)
    ├── utils/                      # apiResponse, paginate, logger
    ├── routes/system.js            # /health, trang chủ tạm
    ├── styles/tailwind.css         # nguồn Tailwind cho trang tĩnh
    ├── views/                      # CHỈ view dùng chung
    │   ├── layouts/                #   customer.hbs (TV3), admin.hbs (TV2), static.hbs (TV2)
    │   ├── partials/               #   flash, pagination
    │   └── errors/                 #   404, error
    └── modules/                    # FEATURE-BASED: mỗi thành viên một module (tự động mount)
        ├── auth/        (TV1)
        ├── catalog/     (TV2)      #   routes.js, migrations/, seeds/
        │   └── stations/           #   feature: *.routes.js, *.controller.js, *.model.js, *.hbs
        ├── trips/       (TV3)
        ├── bookings/    (TV4)
        └── operations/  (TV5)
```

Chi tiết quy ước Feature-based + MVC: [CONTRIBUTING.md](CONTRIBUTING.md#3-cấu-trúc-thư-mục-feature-based--mvc).
