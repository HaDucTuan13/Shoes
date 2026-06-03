const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const cartController = require('../controller/cart.controller');

router.post('/add-to-cart', authUser, asyncHandler(cartController.addToCart));
router.get('/get-cart', authUser, asyncHandler(cartController.getCart));
router.put('/update-quantity', authUser, asyncHandler(cartController.updateCartQuantity));
router.delete('/remove-item', authUser, asyncHandler(cartController.removeItemFromCart));
router.post('/apply-coupon', authUser, asyncHandler(cartController.applyCoupon));
router.put('/update-info-cart', authUser, asyncHandler(cartController.updateInfoCart));

module.exports = router;
