const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/counpon.model');
const modelFlashSale = require('../models/flashSale.model');
const { BadRequestError } = require('../core/error.response');

class CartService {
    async calculateTotal(cart, productsData) {
        let total = 0;
        const now = new Date();
        for (const item of cart.products) {
            let discount = 0;
            const product = productsData.find((p) => p._id.toString() === item.productId.toString());
            const findFlashSale = await modelFlashSale.findOne({
                productId: item.productId,
                startDate: { $lte: now },
                endDate: { $gte: now },
            });
            if (findFlashSale) {
                discount = findFlashSale.discount;
            } else {
                discount = product?.discount || 0;
            }
            if (product) {
                const priceAfterDiscount = Math.round(product.price * (1 - discount / 100));
                total += priceAfterDiscount * item.quantity;
            }
        }
        return Math.round(total);
    }

    async addToCart(userId, productId, quantity, sizeId, colorId) {
        if (!userId || !productId || !colorId || !sizeId) {
            throw new BadRequestError('Thiếu dữ liệu cần thiết');
        }

        const realProductId = String(productId?._id || productId);
        const realSizeId = String(sizeId?._id || sizeId);
        const realColorId = String(colorId?._id || colorId);
        const addQty = Math.max(1, Number(quantity) || 1);

        const product = await Product.findById(realProductId);
        if (!product) throw new BadRequestError('Không tìm thấy sản phẩm');

        const variant = product.variants.id(realSizeId);
        if (!variant) throw new BadRequestError('Không tìm thấy size sản phẩm');

        if (variant.stock <= 0) {
            throw new BadRequestError('Sản phẩm size này hiện đã hết hàng trong kho');
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            if (addQty > variant.stock) {
                throw new BadRequestError(`Số lượng trong kho chỉ còn tối đa ${variant.stock} sản phẩm`);
            }
            cart = new Cart({
                userId,
                products: [{ productId: realProductId, colorId: realColorId, sizeId: realSizeId, quantity: addQty }],
                totalPrice: 0,
            });
        } else {
            const existingItem = cart.products.find(
                (item) =>
                    String(item.productId) === realProductId &&
                    String(item.colorId) === realColorId &&
                    String(item.sizeId) === realSizeId,
            );

            if (existingItem) {
                if (existingItem.quantity + addQty > variant.stock) {
                    throw new BadRequestError(
                        `Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ hàng. Trong kho chỉ còn ${variant.stock} sản phẩm (bạn chỉ có thể thêm tối đa ${Math.max(0, variant.stock - existingItem.quantity)} sản phẩm nữa).`
                    );
                }
                existingItem.quantity += addQty;
            } else {
                const totalExistingInCart = cart.products
                    .filter((item) => String(item.productId) === realProductId && String(item.sizeId) === realSizeId)
                    .reduce((sum, item) => sum + item.quantity, 0);

                if (totalExistingInCart + addQty > variant.stock) {
                    throw new BadRequestError(
                        `Tổng số lượng size này trong giỏ hàng vượt quá tồn kho (${variant.stock} sản phẩm)`
                    );
                }
                cart.products.push({ productId: realProductId, colorId: realColorId, sizeId: realSizeId, quantity: addQty });
            }
        }

        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await this.validateAndUpdateCoupon(cart);

        await cart.save();
        return cart;
    }

    async validateAndUpdateCoupon(cart) {
        if (!cart.coupon || !cart.coupon.code) {
            cart.finalPrice = Math.round(cart.totalPrice || 0);
            return;
        }

        const coupon = await Coupon.findOne({ nameCoupon: cart.coupon.code });
        const now = new Date();

        // Kiểm tra nếu giỏ hàng rỗng hoặc không đủ minPrice hoặc coupon hết hạn / không tồn tại
        if (
            !coupon ||
            !cart.products ||
            cart.products.length === 0 ||
            cart.totalPrice < coupon.minPrice ||
            now < coupon.startDate ||
            now > coupon.endDate
        ) {
            // Hoàn lại lượt sử dụng cho coupon
            if (coupon) {
                coupon.quantity += 1;
                await coupon.save();
            }
            cart.coupon = undefined;
            cart.finalPrice = Math.round(cart.totalPrice || 0);
        } else {
            // Cập nhật lại số tiền giảm giá và giá cuối theo totalPrice mới
            const discountAmount = Math.round((cart.totalPrice * coupon.discount) / 100);
            cart.coupon.discount = coupon.discount;
            cart.coupon.discountAmount = discountAmount;
            cart.finalPrice = Math.max(0, cart.totalPrice - discountAmount);
        }
    }

    async getCart(userId) {
        let cart = await Cart.findOne({ userId });
        if (!cart) return { items: [], coupon: [], appliedCoupon: null, totalPrice: 0, finalPrice: 0 };

        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });

        // Tự động gộp các dòng trùng lặp (cùng productId, colorId, sizeId)
        const mergedMap = new Map();
        for (const item of cart.products) {
            const key = `${String(item.productId)}_${String(item.colorId)}_${String(item.sizeId)}`;
            if (mergedMap.has(key)) {
                mergedMap.get(key).quantity += item.quantity;
            } else {
                mergedMap.set(key, {
                    _id: item._id,
                    productId: item.productId,
                    colorId: item.colorId,
                    sizeId: item.sizeId,
                    quantity: item.quantity,
                });
            }
        }

        const cleanedProducts = Array.from(mergedMap.values()).map((item) => {
            const product = productsData.find((p) => String(p._id) === String(item.productId));
            const variant = product?.variants?.find((v) => String(v._id) === String(item.sizeId));
            const maxStock = variant ? variant.stock : item.quantity;
            return {
                _id: item._id,
                productId: item.productId,
                colorId: item.colorId,
                sizeId: item.sizeId,
                quantity: Math.min(item.quantity, Math.max(1, maxStock)),
            };
        });

        cart.products = cleanedProducts;
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await this.validateAndUpdateCoupon(cart);
        await cart.save();

        const populatedCart = await Cart.findOne({ userId })
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .lean();

        const today = new Date();
        const coupon = await Coupon.find({
            startDate: { $lte: today },
            endDate: { $gte: today },
            minPrice: { $lte: populatedCart.totalPrice },
            quantity: { $gt: 0 },
        }).lean();

        const items = await Promise.all(
            populatedCart.products.map(async (item) => {
                const product = item.productId;
                if (!product) return null;
                const color = product.colors?.find((c) => c._id.toString() === item.colorId.toString());
                const variant = product.variants?.find((v) => v._id.toString() === item.sizeId.toString());

                let discount = 0;
                const findFlashSale = await modelFlashSale.findOne({
                    productId: item.productId,
                    startDate: { $lte: today },
                    endDate: { $gte: today },
                });
                if (findFlashSale) {
                    discount = findFlashSale.discount;
                } else {
                    discount = product?.discount || 0;
                }

                const priceAfterDiscount = Math.round(product.price * (1 - discount / 100));

                return {
                    _id: item._id,
                    productId: product._id,
                    colorId: item.colorId,
                    sizeId: item.sizeId,
                    name: product.name,
                    price: product.price,
                    discount,
                    priceAfterDiscount,
                    color: color ? color.name : null,
                    image: color ? color.images : null,
                    size: variant ? variant.size : null,
                    quantity: item.quantity,
                    stock: variant ? variant.stock : 99,
                    subtotal: priceAfterDiscount * item.quantity,
                    coupon: populatedCart.coupon,
                };
            }),
        );

        return {
            items: items.filter(Boolean),
            totalPrice: Math.round(populatedCart.totalPrice || 0),
            finalPrice: Math.round(populatedCart.finalPrice || populatedCart.totalPrice || 0),
            appliedCoupon: populatedCart.coupon || null,
            coupon,
        };
    }

    async updateCartQuantity(userId, itemId, newQuantity) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new BadRequestError('Không tìm thấy giỏ hàng');

        const cartItem = cart.products.id(itemId);
        if (!cartItem) throw new BadRequestError('Không tìm thấy sản phẩm trong giỏ hàng');

        const product = await Product.findById(cartItem.productId);
        if (!product) throw new BadRequestError('Không tìm thấy sản phẩm trong kho');

        const variant = product.variants.id(cartItem.sizeId);
        if (!variant) throw new BadRequestError('Không tìm thấy size trong sản phẩm');

        const targetQty = Number(newQuantity);
        if (targetQty < 1) {
            throw new BadRequestError('Số lượng phải lớn hơn hoặc bằng 1');
        }

        if (targetQty > variant.stock) {
            throw new BadRequestError(`Số lượng trong kho chỉ còn tối đa ${variant.stock} sản phẩm`);
        }

        cartItem.quantity = targetQty;
        await cart.save();

        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await this.validateAndUpdateCoupon(cart);
        await cart.save();

        return cart;
    }

    async removeItemFromCart(userId, itemId) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error('Không tìm thấy giỏ hàng');

        const cartItem = cart.products.id(itemId);
        if (!cartItem) throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');

        // Xóa khỏi giỏ, không cộng lại stock
        cart.products.pull(itemId);
        await cart.save();

        const allProductIds = cart.products.map((p) => p.productId);
        const productsData = await Product.find({ _id: { $in: allProductIds } });
        cart.totalPrice = await this.calculateTotal(cart, productsData);
        await this.validateAndUpdateCoupon(cart);
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

        if (cart.coupon && cart.coupon.code) {
            const oldCoupon = await Coupon.findOne({ nameCoupon: cart.coupon.code });
            if (oldCoupon) {
                oldCoupon.quantity += 1;
                await oldCoupon.save();
            }
        }

        const discountAmount = Math.round((cart.totalPrice * newCoupon.discount) / 100);
        const finalPrice = Math.max(cart.totalPrice - discountAmount, 0);

        cart.coupon = {
            code: newCoupon.nameCoupon,
            discount: newCoupon.discount,
            discountAmount,
        };
        cart.finalPrice = finalPrice;
        newCoupon.quantity -= 1;

        await Promise.all([cart.save(), newCoupon.save()]);

        return {
            message: `Áp dụng mã ${newCoupon.nameCoupon} thành công!`,
            totalPrice: Math.round(cart.totalPrice),
            discount: newCoupon.discount,
            discountAmount,
            finalPrice: Math.round(finalPrice),
        };
    }

    async removeCoupon(userId) {
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new BadRequestError('Giỏ hàng không tồn tại');

        if (cart.coupon && cart.coupon.code) {
            const oldCoupon = await Coupon.findOne({ nameCoupon: cart.coupon.code });
            if (oldCoupon) {
                oldCoupon.quantity += 1;
                await oldCoupon.save();
            }
            cart.coupon = undefined;
            cart.finalPrice = Math.round(cart.totalPrice || 0);
            await cart.save();
        }

        return cart;
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