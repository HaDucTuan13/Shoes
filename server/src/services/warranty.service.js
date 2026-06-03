const Warranty = require('../models/warranty.model');
const User = require('../models/users.model');
const SendMailAcceptExchange = require('../utils/sendMailAcceptExchange');

class WarrantyService {
    async getWarrantyByUserId(userId) {
        const warranty = await Warranty.find({ userId }).populate('productId');
        return warranty;
    }

    async createWarranty(reason, warrantyId, images, status, description) {
        const warranty = await Warranty.findByIdAndUpdate(
            warrantyId,
            { reason, images, status, description },
            { new: true },
        );
        return warranty;
    }

    async getWarrantyByAdmin() {
        const warranty = await Warranty.find({ status: 'processing' })
            .populate('productId', 'name price colors')
            .populate('userId', 'name email phone');
        return warranty;
    }

    async updateWarrantyStatus(warrantyId, status) {
        const warranty = await Warranty.findByIdAndUpdate(warrantyId, { status }, { new: true });
        const findUSer = await User.findById(warranty.userId);
        await SendMailAcceptExchange(findUSer.email, warranty._id.toString());
        return warranty;
    }
}

module.exports = new WarrantyService();
