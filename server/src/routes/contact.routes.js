const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const contactController = require('../controller/contact.controller');

router.post('/create', authUser, asyncHandler(contactController.create));
router.get('/all', asyncHandler(contactController.getAll));
router.put('/update/:id', asyncHandler(contactController.updateStatus));

module.exports = router;
