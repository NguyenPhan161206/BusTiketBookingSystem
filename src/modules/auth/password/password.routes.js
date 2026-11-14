const express = require('express');
const controller = require('./password.controller');
const { redirectIfAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/auth/forgot-password', redirectIfAuth, controller.showForgotPassword);
router.post('/auth/forgot-password', redirectIfAuth, controller.handleForgotPassword);
router.get('/auth/reset-password', redirectIfAuth, controller.showResetPassword);
router.post('/auth/reset-password', redirectIfAuth, controller.handleResetPassword);

module.exports = router;
