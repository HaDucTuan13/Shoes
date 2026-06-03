const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const paymentController = require('../controller/payment.controller');

router.post('/create', authUser, asyncHandler(paymentController.createPayment));
router.get('/detail/:id', authUser, asyncHandler(paymentController.getPaymentById));
router.get('/momo', asyncHandler(paymentController.momoCallback));
router.get('/vnpay', asyncHandler(paymentController.vnpayCallback));
router.get('/all', authAdmin, asyncHandler(paymentController.getAllOrder));
router.put('/update-status/:id', authAdmin, asyncHandler(paymentController.updateOrderStatus));
router.get('/order-history', authUser, asyncHandler(paymentController.getOrderHistory));

module.exports = router;
