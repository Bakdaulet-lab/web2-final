// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Check QIWI wallet balance
router.get('/balance', paymentController.checkBalance);

// Send payment to another QIWI wallet
router.post('/send', paymentController.sendPayment);

// Get transaction history
router.get('/transactions', paymentController.getTransactionHistory);

module.exports = router;