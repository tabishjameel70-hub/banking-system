const express = require('express');
const app = express();
const router = express.Router();
const  authMiddleware  = require("../middleware/auth.middleware");
const transactionController = require('../controllers/transaction.controller');
app.use(express.json());
router.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);
router.post('/system/initial-funds', authMiddleware.authsystemMiddleware, transactionController.createInitialFundsTransaction);
module.exports = router;
