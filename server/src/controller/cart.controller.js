const { OK } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
    async addToCart(req, res) {
        const { productId, quantity, size, color } = req.body;
        const { id } = req.user;
        const cart = await CartService.addToCart(id, productId, quantity, size, color);
        new OK({ message: 'success', metadata: cart }).send(res);
    }
    async getCart(req, res) {
        const { id } = req.user;
        const cart = await CartService.getCart(id);
        new OK({ message: 'success', metadata: cart }).send(res);
    }

    async updateCartQuantity(req, res) {
        const { id } = req.user;
        const { itemId, quantity } = req.body;
        const cart = await CartService.updateCartQuantity(id, itemId, quantity);
        new OK({ message: 'success', metadata: cart }).send(res);
    }

    async removeItemFromCart(req, res) {
        const { id } = req.user;
        const { itemId } = req.body;
        const cart = await CartService.removeItemFromCart(id, itemId);
        new OK({ message: 'success', metadata: cart }).send(res);
    }

    async applyCoupon(req, res) {
        const { id } = req.user;
        const { couponCode } = req.body;
        const cart = await CartService.applyCoupon(id, couponCode);
        new OK({ message: 'success', metadata: cart }).send(res);
    }

    async updateInfoCart(req, res) {
        const { id } = req.user;
        const { fullName, phone, address } = req.body;
        const cart = await CartService.updateInfoCart(id, fullName, phone, address);
        new OK({ message: 'success', metadata: cart }).send(res);
    }
}

module.exports = new CartController();
