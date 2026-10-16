const express = require('express');
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controllers");
const router = express.Router();

// Account Routes
router.post('/', authMiddleware, accountController.CreateaccountController);
router.get('/', authMiddleware, accountController.getUserAccountController);
router.get('/balance/:accountId', authMiddleware, accountController.getUserAccountBalance);

module.exports = router;