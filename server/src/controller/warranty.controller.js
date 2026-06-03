const WarrantyService = require('../services/warranty.service');

const { OK } = require('../core/success.response');

class WarrantyController {
    async getWarrantyByUserId(req, res, next) {
        const { id } = req.user;
        const warranty = await WarrantyService.getWarrantyByUserId(id);
        new OK({ message: 'success', metadata: warranty }).send(res);
    }

    async requestWarranty(req, res, next) {
        const { reason, warrantyId, status, description } = req.body;
        const images = req.files.map((file) => file.filename);
        const warranty = await WarrantyService.createWarranty(reason, warrantyId, images, status, description);
        new OK({ message: 'success', metadata: warranty }).send(res);
    }

    async getWarrantyByAdmin(req, res, next) {
        const warranty = await WarrantyService.getWarrantyByAdmin();
        new OK({ message: 'success', metadata: warranty }).send(res);
    }

    async updateWarrantyStatus(req, res) {
        const { warrantyId } = req.params;
        const { status } = req.body;
        const warranty = await WarrantyService.updateWarrantyStatus(warrantyId, status);
        new OK({ message: 'success', metadata: warranty }).send(res);
    }
}

module.exports = new WarrantyController();
