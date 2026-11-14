const express = require('express');

const router = express.Router();

// Mount các feature con của module auth
router.use(require('./register/register.routes'));
router.use(require('./login/login.routes'));
router.use(require('./password/password.routes'));
router.use(require('./profile/profile.routes'));
router.use(require('./users/users.routes'));

module.exports = router;
