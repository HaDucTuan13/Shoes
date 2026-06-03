const FlashSaleService = require('../services/flashSale.service');
const { Created, OK } = require('../core/success.response');

class FlashSaleController {
    async createFlashSale(req, res) {
        const data = req.body;
        const flashSale = await FlashSaleService.createFlashSale(data);
        new Created({
            message: 'Tạo flash sale thành công',
            metadata: flashSale,
        }).send(res);
    }

    async getAllFlashSale(req, res) {
        const flashSales = await FlashSaleService.getAllFlashSale();
        new OK({
            message: 'Lấy danh sách flash sale thành công',
            metadata: flashSales,
        }).send(res);
    }

    async getFlashSaleByDate(req, res) {
        const flashSales = await FlashSaleService.getFlashSaleByDate();
        new OK({
            message: 'Lấy danh sách flash sale thành công',
            metadata: flashSales,
        }).send(res);
    }

    async updateFlashSale(req, res) {
        const { id } = req.params;
        const data = req.body;
        const flashSale = await FlashSaleService.updateFlashSale(id, data);
        new OK({
            message: 'Cập nhật flash sale thành công',
            metadata: flashSale,
        }).send(res);
    }

    async deleteFlashSale(req, res) {
        const { id } = req.params;
        const result = await FlashSaleService.deleteFlashSale(id);
        new OK({
            message: 'Xóa flash sale thành công',
            metadata: result,
        }).send(res);
    }
}

module.exports = new FlashSaleController();
