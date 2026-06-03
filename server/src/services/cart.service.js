const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/counpon.model');
const modelFlashSale = require('../models/flashSale.model');
const { BadRequestError } = require('../core/error.response');

class CartService {
    async calculateTotal(cart, productsData) {
        let total = 0;

        for (const item of cart.products) {
            let discount = 0;
            const product = productsData.find((p) => p._id.toString() === item.productId.toString());

            const findFlashSale = await modelFlashSale.findOne({ productId: item.productId });
            if (findFlashSale) {
                discount = findFlashSale.discount;
            } else {
                discount = product?.discount || 0;
            }

            if (product) {
                const priceAfterDiscount = product.price * (1 - discount / 100);
                total += priceAfterDiscount * item.quantity;
            }
        }

        return total;
    }

    async addToCart(userId, productId, quantity, sizeId, colorId) {
        if (!userId || !productId || !colorId || !sizeId) {
            throw new Error('Thiếu dữ liệu cần thiết');
        }

        const product = await Product.findById(productId);
        if (!product) throw new Error('Không tìm thấy sản phẩm');

        const variant = product.variants.id(sizeId);
        if (!variant) throw new Error('Không tìm thấy size sản phẩm');
        if (variant.stock < quantity) throw new Error('Số lượng trong kho không đủ');

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                products: [{ productId, colorId, sizeId, quantity }],
                totalPrice: 0,
            });
        } else {
            const existingItem = cart.products.find(
                (item) =>
                    item.productId.toString() === productId &&
                    item.colorId.toString() === colorId.toString() &&
                    item.sizeId.toString() === sizeId.toString(),
            );

            if (existingItem) {
                if (variant.stock < quantity) throw new Error('Số lượng trong kho không đủ để thêm');
                existingItem.quantity += quantity;
            } else {
                cart.products.push({ productId, colorId, sizeId, quantity });
            }
        }

        variant.stock -= quantity;

        // 🧮 Tính tổng trước khi lưu
        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);

        await Promise.all([product.save(), cart.save()]);

        return cart;
    }

    // 📦 Lấy giỏ hàng
    async getCart(userId) {
        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .lean();

        if (!cart) return { items: [], coupon: [] };

        const today = new Date();

        const coupon = await Coupon.find({
            startDate: { $lte: today },
            endDate: { $gte: today },
            minPrice: { $lte: cart.totalPrice },
            quantity: { $gt: 0 },
        }).lean();

        // 🔁 Xử lý từng sản phẩm trong giỏ hàng
        const items = await Promise.all(
            cart.products.map(async (item) => {
                const product = item.productId;
                const color = product.colors.find((c) => c._id.toString() === item.colorId.toString());
                const variant = product.variants.find((v) => v._id.toString() === item.sizeId.toString());

                // 🔍 Kiểm tra flash sale
                let discount = 0;
                const findFlashSale = await modelFlashSale.findOne({ productId: item.productId });
                if (findFlashSale) {
                    discount = findFlashSale.discount;
                } else {
                    discount = product?.discount || 0;
                }

                const priceAfterDiscount = product.price * (1 - discount / 100);

                return {
                    _id: item._id,
                    name: product.name,
                    price: product.price, // giá gốc
                    discount, // % giảm
                    priceAfterDiscount, // giá sau giảm
                    color: color ? color.name : null,
                    image: color ? color.images : null,
                    size: variant ? variant.size : null,
                    quantity: item.quantity,
                    subtotal: priceAfterDiscount * item.quantity,
                    coupon: cart.coupon,
                };
            }),
        );

        return { items, totalPrice: cart.totalPrice, coupon };
    }

    // ✏️ Cập nhật số lượng
    async updateCartQuantity(userId, itemId, newQuantity) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error('Không tìm thấy giỏ hàng');

        const cartItem = cart.products.id(itemId);
        if (!cartItem) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        const product = await Product.findById(cartItem.productId);
        if (!product) throw new Error('Không tìm thấy sản phẩm trong kho');

        const variant = product.variants.id(cartItem.sizeId);
        if (!variant) throw new Error('Không tìm thấy size trong sản phẩm');

        const diff = newQuantity - cartItem.quantity;

        if (diff > 0) {
            if (variant.stock < diff) throw new Error('Số lượng trong kho không đủ');
            variant.stock -= diff;
        } else if (diff < 0) {
            variant.stock += Math.abs(diff);
        }

        cartItem.quantity = newQuantity;
        await Promise.all([cart.save(), product.save()]);

        // 🧮 Cập nhật tổng tiền
        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await cart.save();

        return cart;
    }

    // ❌ Xóa sản phẩm
    async removeItemFromCart(userId, itemId) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error('Không tìm thấy giỏ hàng');

        const cartItem = cart.products.id(itemId);
        if (!cartItem) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        const product = await Product.findById(cartItem.productId);
        if (!product) throw new Error('Không tìm thấy sản phẩm trong kho');

        const variant = product.variants.id(cartItem.sizeId);
        if (!variant) throw new Error('Không tìm thấy size sản phẩm');

        variant.stock += cartItem.quantity;
        cart.products.pull(itemId);

        await Promise.all([cart.save(), product.save()]);

        // 🧮 Cập nhật tổng tiền sau khi xóa
        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await cart.save();

        return cart;
    }

    async applyCoupon(userId, nameCoupon) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new BadRequestError('Giỏ hàng không tồn tại');

        const newCoupon = await Coupon.findOne({ nameCoupon });
        if (!newCoupon) throw new BadRequestError('Mã giảm giá không tồn tại');

        const now = new Date();
        if (now < newCoupon.startDate || now > newCoupon.endDate) {
            throw new BadRequestError('Mã giảm giá đã hết hạn hoặc chưa được kích hoạt');
        }

        if (newCoupon.quantity <= 0) {
            throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');
        }

        if (cart.totalPrice < newCoupon.minPrice) {
            throw new BadRequestError(
                `Đơn hàng phải tối thiểu ${newCoupon.minPrice.toLocaleString()} VND để dùng mã này`,
            );
        }

        // 🧾 Nếu giỏ hàng đã có mã trước đó → hoàn lại lượt
        if (cart.coupon && cart.coupon.code) {
            const oldCoupon = await Coupon.findOne({ nameCoupon: cart.coupon.code });
            if (oldCoupon) {
                oldCoupon.quantity += 1; // hoàn lại lượt
                await oldCoupon.save();
            }
        }

        // ✅ Tính giảm mới
        const discountAmount = (cart.totalPrice * newCoupon.discount) / 100;
        const finalPrice = Math.max(cart.totalPrice - discountAmount, 0);

        // ✅ Cập nhật lại thông tin mã mới
        cart.coupon = {
            code: newCoupon.nameCoupon,
            discount: newCoupon.discount,
            discountAmount,
        };
        cart.finalPrice = finalPrice;

        // ✅ Giảm lượt của mã mới
        newCoupon.quantity -= 1;

        await Promise.all([cart.save(), newCoupon.save()]);

        return {
            message: `Áp dụng mã ${newCoupon.nameCoupon} thành công!`,
            totalPrice: cart.totalPrice,
            discount: newCoupon.discount,
            discountAmount,
            finalPrice,
        };
    }

    async updateInfoCart(userId, fullName, phone, address) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new BadRequestError('Giỏ hàng không tồn tại');
        cart.fullName = fullName;
        cart.phone = phone;
        cart.address = address;
        await cart.save();
        return cart;
    }
}

module.exports = new CartService();
