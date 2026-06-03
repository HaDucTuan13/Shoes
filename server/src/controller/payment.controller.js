const PaymentService = require('../services/payment.service');

const { OK } = require('../core/success.response');

class PaymentController {
    async createPayment(req, res) {
        const { id } = req.user;
        const { paymentMethod } = req.body;
        const payment = await PaymentService.createPayment(paymentMethod, id);
        new OK({ message: 'success', metadata: payment }).send(res);
    }

    async getPaymentById(req, res) {
        const { id } = req.params;
        const payment = await PaymentService.getPaymentById(id);
        new OK({ message: 'success', metadata: payment }).send(res);
    }

    async momoCallback(req, res) {
        const { orderInfo } = req.query;
        const id = orderInfo.split(' ')[4];
        const payment = await PaymentService.momoCallback(id);
        res.redirect(`${process.env.URL_CLIENT}/payment/success/${payment._id}`);
    }

    async vnpayCallback(req, res, next) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        const id = vnp_OrderInfo.split(' ')[4];
        const payment = await PaymentService.vnpayCallback(id);
        res.redirect(`${process.env.URL_CLIENT}/payment/success/${payment._id}`);
    }

    async getAllOrder(req, res) {
        const orders = await PaymentService.getAllOrder();
        new OK({ message: 'success', metadata: orders }).send(res);
    }

    async updateOrderStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const order = await PaymentService.updateOrderStatus(id, status);
        new OK({ message: 'Cập nhật trạng thái thành công', metadata: order }).send(res);
    }

    async getOrderHistory(req, res) {
        const { id } = req.user;
        const orders = await PaymentService.getOrderHistory(id);
        new OK({ message: 'success', metadata: orders }).send(res);
    }
}

module.exports = new PaymentController();
