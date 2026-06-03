const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const couponController = require('../controller/counpon.controller');

router.post('/create', asyncHandler(couponController.create));
router.get('/all', asyncHandler(couponController.findAll));
router.put('/update', asyncHandler(couponController.update));
router.delete('/delete', asyncHandler(couponController.delete));
router.post('/findById', asyncHandler(couponController.findById));

module.exports = router;
