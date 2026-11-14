const express = require('express');
const controller = require('./register.controller');
const { redirectIfAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/auth/register', redirectIfAuth, controller.showRegisterForm);
router.post('/auth/register', redirectIfAuth, controller.handleRegister);
router.get('/auth/verify-email', controller.verifyEmail);

module.exports = router;
