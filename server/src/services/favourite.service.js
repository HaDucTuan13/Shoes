const { BadRequestError } = require('../core/error.response');
const Favourite = require('../models/favourite.model');
const Product = require('../models/product.model');

class FavouriteService {
    async createFavourite(userId, productId) {
        const findFavourite = await Favourite.findOne({ userId, productId });
        if (findFavourite) {
            await Favourite.findByIdAndDelete(findFavourite._id);
            await Product.findByIdAndUpdate(productId, { $pull: { favourite: userId } });

            throw new BadRequestError('Đã sản phẩm khỏi yêu thích');
        } else {
            const favourite = await Favourite.create({ userId, productId });
            await Product.findByIdAndUpdate(productId, { $push: { favourite: userId } });
            return favourite;
        }
    }

    async getFavouriteByUserId(userId) {
        const favourite = await Favourite.find({ userId }).populate('productId');
        return favourite;
    }
}

module.exports = new FavouriteService();
