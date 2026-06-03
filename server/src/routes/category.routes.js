const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/category');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler, authUser } = require('../auth/checkAuth');

const categoryController = require('../controller/category.controller');

router.post('/create', authUser, upload.single('image'), asyncHandler(categoryController.createCategory));
router.post('/upload-image', authUser, upload.single('image'), asyncHandler(categoryController.uploadImage));
router.get('/all', asyncHandler(categoryController.getAllCategory));
router.post('/update', authUser, upload.single('image'), asyncHandler(categoryController.updateCategory));
router.delete('/delete/:id', authUser, asyncHandler(categoryController.deleteCategory));

module.exports = router;
