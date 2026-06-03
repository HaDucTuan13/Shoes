const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'src/uploads/previewProducts';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/previewProducts');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const previewProductController = require('../controller/previewProduct.controller');

router.post('/create', authUser, upload.array('images'), asyncHandler(previewProductController.createPreviewProduct));
router.get('/getAll', asyncHandler(previewProductController.getAllPreviewProduct));

module.exports = router;
