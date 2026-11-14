const express = require('express');
const controller = require('./profile.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/account/profile', requireAuth, controller.showProfile);
router.post('/account/profile', requireAuth, controller.updateProfile);
router.post('/account/change-password', requireAuth, controller.changePassword);
router.get('/account/bookings', requireAuth, controller.bookingHistory);

module.exports = router;
