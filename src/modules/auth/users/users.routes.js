const express = require('express');
const controller = require('./users.controller');
const { requireRole } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/admin/users', requireRole('admin'), controller.list);
router.get('/admin/users/create', requireRole('admin'), controller.showCreateForm);
router.post('/admin/users/create', requireRole('admin'), controller.handleCreate);
router.get('/admin/users/:id', requireRole('admin'), controller.showDetail);
router.post('/admin/users/:id', requireRole('admin'), controller.handleUpdate);
router.post('/admin/users/:id/toggle', requireRole('admin'), controller.toggleStatus);

module.exports = router;
