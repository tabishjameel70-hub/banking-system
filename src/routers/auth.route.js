const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
router.post('/signup',authController.userRegisteration)
router.post('/login',authController.userLoginContolller)
router.post('/logout',authController.userLogoutController)
module.exports = router;