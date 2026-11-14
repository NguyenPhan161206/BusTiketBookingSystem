/**
 * Route hệ thống do base quản lý.
 *  - publicRouter:   /health (không dùng session)
 *  - fallbackRouter: trang chủ tạm "/" - TV3 khai báo GET "/" trong module trips sẽ tự thay thế.
 */
const express = require('express');
const db = require('../db/knex');

const publicRouter = express.Router();

publicRouter.get('/health', async (_req, res) => {
  let dbStatus = 'up';
  try {
    await db.raw('select 1');
  } catch {
    dbStatus = 'down';
  }
  res.status(dbStatus === 'up' ? 200 : 503).json({
    status: dbStatus === 'up' ? 'ok' : 'degraded',
    db: dbStatus,
    uptime: Math.round(process.uptime()),
  });
});

const fallbackRouter = express.Router();

fallbackRouter.get('/', (_req, res) => {
  res.render('home', { title: 'Trang chủ' });
});

module.exports = { publicRouter, fallbackRouter };
