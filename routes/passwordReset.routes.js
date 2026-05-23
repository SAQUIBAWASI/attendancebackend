const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controller/passwordReset.controller.js');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/reset-password', resetPassword); // Allow both depending on how frontend calls it

module.exports = router;
