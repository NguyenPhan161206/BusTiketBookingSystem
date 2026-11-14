/**
 * Tạo file migration / seed trong đúng thư mục module.
 *   npm run migrate:make -- <module> <tên>     vd: npm run migrate:make -- catalog create_stations_table
 *   npm run seed:make    -- <module> <tên>     vd: npm run seed:make -- catalog 20_catalog_stations
 */
const fs = require('node:fs');
const path = require('node:path');
const knex = require('knex');
const dbConfig = require('../src/config/database');

const [kind, moduleName, name] = process.argv.slice(2);
const usage = `Cách dùng: npm run ${kind === 'seed' ? 'seed' : 'migrate'}:make -- <module> <tên>`;

if (!['migration', 'seed'].includes(kind) || !moduleName || !name) {
  console.error(usage);
  process.exit(1);
}

const moduleDir = path.join(dbConfig.MODULES_DIR, moduleName);
if (!fs.existsSync(moduleDir)) {
  const available = fs
    .readdirSync(dbConfig.MODULES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  console.error(`Module "${moduleName}" không tồn tại. Có: ${available.join(', ')}`);
  process.exit(1);
}

const directory = path.join(moduleDir, kind === 'seed' ? 'seeds' : 'migrations');
fs.mkdirSync(directory, { recursive: true });

const db = knex({ client: 'pg' });
const task =
  kind === 'seed' ? db.seed.make(name, { directory }) : db.migrate.make(name, { directory });

task
  .then((file) => console.log(`Đã tạo: ${path.relative(process.cwd(), file)}`))
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
