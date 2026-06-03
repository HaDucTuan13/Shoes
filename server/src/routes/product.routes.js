const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'src/uploads/products';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const productController = require('../controller/product.controller');

router.post('/create', authUser, asyncHandler(productController.createProduct));
router.put('/update/:id', authUser, asyncHandler(productController.updateProduct));
router.delete('/delete/:id', authUser, asyncHandler(productController.deleteProduct));
router.post('/upload-image', authUser, upload.single('image'), asyncHandler(productController.uploadImage));
router.get('/all', asyncHandler(productController.getAllProduct));
router.get('/filter', asyncHandler(productController.filterProduct));
router.get('/category/:category', asyncHandler(productController.getProductByCategory));
router.get('/product/:id', asyncHandler(productController.getProductById));
router.get('/search/:query', asyncHandler(productController.searchProduct));

module.exports = router;
