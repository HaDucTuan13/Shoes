const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/warranty');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const warrantyController = require('../controller/warranty.controller');

router.get('/history', authUser, asyncHandler(warrantyController.getWarrantyByUserId));
router.post('/request', authUser, upload.array('images'), asyncHandler(warrantyController.requestWarranty));
router.get('/admin', authAdmin, asyncHandler(warrantyController.getWarrantyByAdmin));
router.put('/admin/:warrantyId', authAdmin, asyncHandler(warrantyController.updateWarrantyStatus));

module.exports = router;
