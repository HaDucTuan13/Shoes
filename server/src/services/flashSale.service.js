const FlashSale = require('../models/flashSale.model');

class FlashSaleService {
    async createFlashSale(data) {
        await Promise.all(
            data.map(async (item) => {
                await FlashSale.create(item);
            }),
        );
        return data;
    }

    async getAllFlashSale() {
        const flashSales = await FlashSale.find().populate('productId');
        return flashSales;
    }

    async getFlashSaleByDate() {
        const today = new Date();
        const flashSales = await FlashSale.find({
            startDate: { $lte: today },
            endDate: { $gte: today },
        }).populate('productId');
        return flashSales;
    }

    async updateFlashSale(id, data) {
        const flashSale = await FlashSale.findByIdAndUpdate(id, data, { new: true });
        return flashSale;
    }

    async deleteFlashSale(id) {
        const result = await FlashSale.findByIdAndDelete(id);
        return result;
    }
}

module.exports = new FlashSaleService();
