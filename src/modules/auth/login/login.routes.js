const express = require('express');
const controller = require('./login.controller');
const { redirectIfAuth, requireAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/auth/login', redirectIfAuth, controller.showLoginForm);
router.post('/auth/login', redirectIfAuth, controller.handleLogin);
router.post('/auth/logout', requireAuth, controller.handleLogout);

module.exports = router;
