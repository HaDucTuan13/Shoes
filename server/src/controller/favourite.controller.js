const FavouriteService = require('../services/favourite.service');
const { OK } = require('../core/success.response');

class FavouriteController {
    async createFavourite(req, res) {
        const { id } = req.user;
        const { productId } = req.body;
        const favourite = await FavouriteService.createFavourite(id, productId);
        new OK({ message: 'success', metadata: favourite }).send(res);
    }

    async getFavouriteByUserId(req, res) {
        const { id } = req.user;
        const favourite = await FavouriteService.getFavouriteByUserId(id);
        new OK({ message: 'success', metadata: favourite }).send(res);
    }
}

module.exports = new FavouriteController();
