const contactService = require('../services/contact.service');

const { OK } = require('../core/success.response');

class ContactController {
    async create(req, res, next) {
        const { id } = req.user;
        const { fullName, email, phone, message, type } = req.body;
        const contact = await contactService.create(id, fullName, email, phone, message, type);
        return new OK({ message: 'Gửi yêu cầu thành công', metadata: contact }).send(res);
    }

    async getAll(req, res, next) {
        const contacts = await contactService.getAll();
        return new OK({ message: 'Lấy danh sách liên hệ thành công', metadata: contacts }).send(res);
    }

    async updateStatus(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;
        const contact = await contactService.updateStatus(id, status);
        return new OK({ message: 'Cập nhật trạng thái liên hệ thành công', metadata: contact }).send(res);
    }
}

module.exports = new ContactController();
