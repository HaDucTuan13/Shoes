const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const userController = require('../controller/user.controller');

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.post('/register', asyncHandler(userController.createUser));
router.get('/auth', authUser, asyncHandler(userController.auth));
router.post('/login', asyncHandler(userController.login));
router.post('/logout', authUser, asyncHandler(userController.logout));
router.get('/refresh-token', asyncHandler(userController.refreshToken));
router.post('/login-google', asyncHandler(userController.loginGoogle));
router.post('/forgot-password', asyncHandler(userController.forgotPassword));
router.post('/reset-password', asyncHandler(userController.resetPassword));
router.put('/update', authUser, asyncHandler(userController.updateUser));
router.post('/upload-avatar', authUser, upload.single('avatar'), asyncHandler(userController.uploadAvatar));
router.post('/chatbot', authUser, asyncHandler(userController.chatbot));
router.get('/message-chatbot', authUser, asyncHandler(userController.getMessageChatbot));

router.get('/admin/users', authUser, asyncHandler(userController.getAllUser));
router.put('/admin/users/:id', authUser, asyncHandler(userController.updateUserAdmin));
router.delete('/admin/users/:id', authUser, asyncHandler(userController.deleteUser));

router.get('/admin/dashboard', authAdmin, asyncHandler(userController.getDashboardAdmin));

router.get('/admin', authAdmin, asyncHandler(userController.getDashboardAdmin));

module.exports = router;
