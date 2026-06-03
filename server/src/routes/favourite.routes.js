const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const favouriteController = require('../controller/favourite.controller');

router.post('/create', authUser, asyncHandler(favouriteController.createFavourite));
router.get('/get-favourite-by-user-id', authUser, asyncHandler(favouriteController.getFavouriteByUserId));

module.exports = router;
