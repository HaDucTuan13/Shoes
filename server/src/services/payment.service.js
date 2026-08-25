const Cart = require('../models/cart.model');
const Payment = require('../models/payment.model');
const Warranty = require('../models/warranty.model');
const PreviewProduct = require('../models/previewProduct.model');
const Product = require('../models/product.model');

const crypto = require('crypto');
const https = require('https');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const dayjs = require('dayjs');

function generateWarrantyProduct(products, userId, orderId) {
    const date = new Date();
    const warrantyProduct = products.map((product) => {
        return Warranty.create({
            orderId,
            userId,
            productId: product.productId,
            reason: null,
            status: 'pending',
            receivedDate: date,
            returnDate: dayjs(date).add(7, 'day').toDate(),
        });
    });
    return warrantyProduct;
}

function generatePayID() {
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

// Trừ stock sau khi đặt hàng thành công
async function deductStock(products) {
    for (const item of products) {
        await Product.updateOne(
            { _id: item.productId, 'variants._id': item.sizeId },
            { $inc: { 'variants.$.stock': -item.quantity } }
        );
    }
}

// Lưu snapshot thông tin sản phẩm và giá tại thời điểm mua
async function createSnapshotProducts(cartProducts) {
    const Product = require('../models/product.model');
    const modelFlashSale = require('../models/flashSale.model');
    const now = new Date();

    const productIds = cartProducts.map((p) => p.productId);
    const productsData = await Product.find({ _id: { $in: productIds } });

    const snapshotProducts = await Promise.all(
        cartProducts.map(async (item) => {
            const product = productsData.find((p) => p._id.toString() === item.productId.toString());
            if (!product) {
                return {
                    productId: item.productId,
                    colorId: item.colorId,
                    sizeId: item.sizeId,
                    quantity: item.quantity,
                };
            }

            const color = product.colors?.find((c) => c._id.toString() === item.colorId.toString());
            const variant = product.variants?.find((v) => v._id.toString() === item.sizeId.toString());

            let discount = 0;
            const findFlashSale = await modelFlashSale.findOne({
                productId: item.productId,
                startDate: { $lte: now },
                endDate: { $gte: now },
            });
            if (findFlashSale) {
                discount = findFlashSale.discount;
            } else {
                discount = product.discount || 0;
            }

            const price = product.price || 0;
            const priceAfterDiscount = Math.round(price * (1 - discount / 100));

            return {
                productId: item.productId,
                colorId: item.colorId,
                sizeId: item.sizeId,
                quantity: item.quantity,
                name: product.name,
                price: price,
                discount: discount,
                priceAfterDiscount: priceAfterDiscount,
                colorName: color ? color.name : '',
                image: color ? color.images : '',
                sizeName: variant ? variant.size : '',
            };
        }),
    );

    return snapshotProducts;
}

class PaymentService {
    async createPayment(paymentMethod, userId) {
        const findCart = await Cart.findOne({ userId });
        if (!findCart) throw new Error('Cart not found');

        if (paymentMethod === 'momo') {
            return new Promise(async (resolve, reject) => {
                const accessKey = 'F8BBA842ECF85';
                const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                const partnerCode = 'MOMO';
                const orderId = partnerCode + new Date().getTime();
                const requestId = orderId;
                const orderInfo = `Thanh toan don hang ${findCart.userId}`;
                const redirectUrl = 'http://localhost:3000/api/payment/momo';
                const ipnUrl = 'http://localhost:3000/api/payment/momo';
                const requestType = 'payWithMethod';
                const amount = findCart.coupon?.code ? findCart.finalPrice : findCart.totalPrice;
                const extraData = '';

                const rawSignature =
                    'accessKey=' + accessKey +
                    '&amount=' + amount +
                    '&extraData=' + extraData +
                    '&ipnUrl=' + ipnUrl +
                    '&orderId=' + orderId +
                    '&orderInfo=' + orderInfo +
                    '&partnerCode=' + partnerCode +
                    '&redirectUrl=' + redirectUrl +
                    '&requestId=' + requestId +
                    '&requestType=' + requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'Test',
                    storeId: 'MomoTestStore',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); }
                        catch (err) { reject(err); }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });

        } else if (paymentMethod === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                loggerFn: ignoreLogger,
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: findCart.coupon?.code ? findCart.finalPrice : findCart.totalPrice,
                vnp_IpAddr: '127.0.0.1',
                vnp_TxnRef: `${findCart.userId} + ${generatePayID()}`,
                vnp_OrderInfo: `Thanh toan don hang ${findCart.userId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/payment/vnpay`,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });
            return vnpayResponse;

        } else if (paymentMethod === 'cod' || paymentMethod === 'bank') {
            const snapshotItems = await createSnapshotProducts(findCart.products);
            const payment = await Payment.create({
                products: snapshotItems,
                totalPrice: findCart.totalPrice,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                finalPrice: findCart.coupon?.code ? findCart.finalPrice : findCart.totalPrice,
                coupon: findCart.coupon,
                userId,
                paymentMethod,
                status: 'pending',
            });

            // Trừ stock
            await deductStock(findCart.products);

            await Cart.findByIdAndDelete(findCart._id);
            return payment;
        }
    }

    async getPaymentById(id) {
        const payment = await Payment.findById(id)
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .lean();

        if (!payment) return null;

        const items = payment.products.map((item) => {
            const product = item.productId || {};
            const color = product.colors?.find((c) => c._id.toString() === item.colorId?.toString());
            const variant = product.variants?.find((v) => v._id.toString() === item.sizeId?.toString());

            const name = item.name || product.name || 'Sản phẩm';
            const price = item.price !== undefined ? item.price : (product.price || 0);
            const discount = item.discount !== undefined ? item.discount : (product.discount || 0);
            const priceAfterDiscount =
                item.priceAfterDiscount !== undefined
                    ? item.priceAfterDiscount
                    : Math.round(price * (1 - discount / 100));
            const colorName = item.colorName || (color ? color.name : null);
            const image = item.image || (color ? color.images : null);
            const size = item.sizeName || (variant ? variant.size : null);

            return {
                _id: item._id,
                name,
                price,
                discount,
                priceAfterDiscount,
                color: colorName,
                image,
                size,
                quantity: item.quantity,
                subtotal: priceAfterDiscount * item.quantity,
                coupon: payment.coupon,
                paymentMethod: payment.paymentMethod,
                idProduct: product._id || item.productId,
            };
        });

        return {
            items,
            totalPrice: payment.totalPrice,
            finalPrice: payment.finalPrice,
            coupon: payment.coupon,
            paymentMethod: payment.paymentMethod,
            fullName: payment.fullName,
            phone: payment.phone,
            address: payment.address,
            status: payment.status,
            createdAt: payment.createdAt,
        };
    }

    async momoCallback(id) {
        const findCart = await Cart.findOne({ userId: id });
        if (!findCart) throw new Error('Cart not found');

        const snapshotItems = await createSnapshotProducts(findCart.products);
        const payment = await Payment.create({
            products: snapshotItems,
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.coupon?.code ? findCart.finalPrice : findCart.totalPrice,
            coupon: findCart.coupon,
            userId: id,
            paymentMethod: 'momo',
            status: 'pending',
        });

        // Trừ stock
        await deductStock(findCart.products);

        await Cart.findByIdAndDelete(findCart._id);
        return payment;
    }

    async vnpayCallback(id) {
        const findCart = await Cart.findOne({ userId: id });
        if (!findCart) throw new Error('Cart not found');

        const snapshotItems = await createSnapshotProducts(findCart.products);
        const payment = await Payment.create({
            products: snapshotItems,
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.finalPrice || findCart.totalPrice,
            coupon: findCart.coupon,
            userId: id,
            paymentMethod: 'vnpay',
            status: 'pending',
        });

        // Trừ stock
        await deductStock(findCart.products);

        await Cart.findByIdAndDelete(findCart._id);
        return payment;
    }

    async getAllOrder() {
        const payments = await Payment.find()
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .populate('userId', 'fullName email phone')
            .lean()
            .sort({ createdAt: -1 });

        const orders = payments.map((payment) => {
            const items = payment.products.map((item) => {
                const product = item.productId || {};
                const color = product.colors?.find((c) => c._id.toString() === item.colorId?.toString());
                const variant = product.variants?.find((v) => v._id.toString() === item.sizeId?.toString());

                const name = item.name || product.name || 'Sản phẩm';
                const price = item.price !== undefined ? item.price : (product.price || 0);
                const discount = item.discount !== undefined ? item.discount : (product.discount || 0);
                const priceAfterDiscount =
                    item.priceAfterDiscount !== undefined
                        ? item.priceAfterDiscount
                        : Math.round(price * (1 - discount / 100));
                const colorName = item.colorName || (color ? color.name : null);
                const image = item.image || (color ? color.images : null);
                const size = item.sizeName || (variant ? variant.size : null);

                return {
                    _id: item._id,
                    name,
                    price,
                    discount,
                    priceAfterDiscount,
                    color: colorName,
                    image,
                    size,
                    quantity: item.quantity,
                    subtotal: priceAfterDiscount * item.quantity,
                    idProduct: product._id || item.productId,
                };
            }).filter(Boolean);

            return {
                _id: payment._id,
                user: payment.userId || null,
                items,
                totalPrice: payment.totalPrice,
                finalPrice: payment.finalPrice,
                coupon: payment.coupon,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                createdAt: payment.createdAt,
                phone: payment.phone,
                address: payment.address,
                fullName: payment.fullName,
            };
        });

        return orders;
    }

    async updateOrderStatus(orderId, status) {
        const order = await Payment.findByIdAndUpdate(orderId, { status }, { new: true });
        if (status === 'delivered') {
            await generateWarrantyProduct(order.products, order.userId, order._id);
        }
        return order;
    }

    async getOrderHistory(userId) {
        const payments = await Payment.find({ userId })
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .populate('userId', 'fullName email phone')
            .lean()
            .sort({ createdAt: -1 });

        const previewProducts = await PreviewProduct.find({ userId });

        const orders = payments.map((payment) => {
            const items = payment.products.map((item) => {
                const product = item.productId || {};
                const color = product.colors?.find((c) => c._id.toString() === item.colorId?.toString());
                const variant = product.variants?.find((v) => v._id.toString() === item.sizeId?.toString());
                const previewProduct = previewProducts.find(
                    (p) => p.productId?.toString() === (product._id || item.productId)?.toString(),
                );

                const name = item.name || product.name || 'Sản phẩm';
                const price = item.price !== undefined ? item.price : (product.price || 0);
                const discount = item.discount !== undefined ? item.discount : (product.discount || 0);
                const priceAfterDiscount =
                    item.priceAfterDiscount !== undefined
                        ? item.priceAfterDiscount
                        : Math.round(price * (1 - discount / 100));
                const colorName = item.colorName || (color ? color.name : null);
                const image = item.image || (color ? color.images : null);
                const size = item.sizeName || (variant ? variant.size : null);

                return {
                    _id: item._id,
                    name,
                    price,
                    discount,
                    priceAfterDiscount,
                    color: colorName,
                    image,
                    size,
                    quantity: item.quantity,
                    subtotal: priceAfterDiscount * item.quantity,
                    idProduct: product._id || item.productId,
                    previewProduct,
                };
            }).filter(Boolean);

            return {
                _id: payment._id,
                user: payment.userId || null,
                items,
                totalPrice: payment.totalPrice,
                finalPrice: payment.finalPrice,
                coupon: payment.coupon,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                createdAt: payment.createdAt,
                phone: payment.phone,
                address: payment.address,
                fullName: payment.fullName,
            };
        });

        return orders;
    }
}

module.exports = new PaymentService();