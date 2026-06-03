const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const flashSaleController = require('../controller/flashSale.controller');

router.post('/create', authAdmin, asyncHandler(flashSaleController.createFlashSale));
router.get('/all', authAdmin, asyncHandler(flashSaleController.getAllFlashSale));
router.get('/date', asyncHandler(flashSaleController.getFlashSaleByDate));

router.put('/update/:id', authAdmin, asyncHandler(flashSaleController.updateFlashSale));
router.delete('/delete/:id', authAdmin, asyncHandler(flashSaleController.deleteFlashSale));

module.exports = router;
