const { OK } = require('../core/success.response');
const PreviewProductService = require('../services/previewProduct.service');

class PreviewProductController {
    async createPreviewProduct(req, res) {
        const { id } = req.user;
        const images = req.files.map((file) => file.filename);
        const { productId, rating, comment } = req.body;
        const previewProduct = await PreviewProductService.create({ userId: id, productId, images, rating, comment });
        new OK({ message: 'success', metadata: previewProduct }).send(res);
    }

    async getAllPreviewProduct(req, res) {
        const previewProduct = await PreviewProductService.getAllPreviewProduct();
        new OK({ message: 'success', metadata: previewProduct }).send(res);
    }
}

module.exports = new PreviewProductController();
