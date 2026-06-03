const Cart = require('../models/cart.model');
const Payment = require('../models/payment.model');
const Warranty = require('../models/warranty.model');
const PreviewProduct = require('../models/previewProduct.model');

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
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

class PaymentService {
    async createPayment(paymentMethod, userId) {
        const findCart = await Cart.findOne({ userId: userId });
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
                const amount = (await findCart.coupon.code) ? findCart.finalPrice : findCart.totalPrice;
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

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
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
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
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: (await findCart.coupon.code) ? findCart.finalPrice : findCart.totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${findCart.userId} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `Thanh toan don hang ${findCart.userId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/payment/vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            return vnpayResponse;
        } else if (paymentMethod === 'cod') {
            const payment = await Payment.create({
                products: findCart.products,
                totalPrice: findCart.totalPrice,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                finalPrice: findCart.finalPrice,
                coupon: findCart.coupon,
                userId,
                paymentMethod,
                totalPrice: findCart.totalPrice,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                finalPrice: findCart.finalPrice,
                coupon: findCart.coupon,
                status: 'pending',
            });
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

        const items = payment.products.map((item) => {
            const product = item.productId;
            const color = product.colors.find((c) => c._id.toString() === item.colorId.toString());
            const variant = product.variants.find((v) => v._id.toString() === item.sizeId.toString());

            const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);

            return {
                _id: item._id,
                name: product.name,
                price: product.price, // giá gốc
                discount: product.discount, // % giảm
                priceAfterDiscount, // giá sau giảm
                color: color ? color.name : null,
                image: color ? color.images : null,
                size: variant ? variant.size : null,
                quantity: item.quantity,
                subtotal: priceAfterDiscount * item.quantity,
                coupon: payment.coupon,
                paymentMethod: payment.paymentMethod,
                idProduct: product._id,
            };
        });
        return { items, totalPrice: payment.totalPrice, coupon: payment.coupon, paymentMethod: payment.paymentMethod };
    }

    async momoCallback(id) {
        const findCart = await Cart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Cart not found');
        }
        const payment = await Payment.create({
            products: findCart.products,
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.finalPrice,
            coupon: findCart.coupon,
            userId: id,
            paymentMethod: 'momo',
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.finalPrice,
            coupon: findCart.coupon,
            status: 'pending',
        });
        await Cart.findByIdAndDelete(findCart._id);
        return payment;
    }

    async vnpayCallback(id) {
        const findCart = await Cart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Cart not found');
        }
        const payment = await Payment.create({
            products: findCart.products,
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.finalPrice,
            coupon: findCart.coupon,
            userId: id,
            paymentMethod: 'vnpay',
            totalPrice: findCart.totalPrice,
            fullName: findCart.fullName,
            phone: findCart.phone,
            address: findCart.address,
            finalPrice: findCart.finalPrice,
            coupon: findCart.coupon,
            status: 'pending',
        });
        await Cart.findByIdAndDelete(findCart._id);
        return payment;
    }

    async getAllOrder() {
        // Lấy toàn bộ đơn hàng + populate sản phẩm
        const payments = await Payment.find()
            .populate({
                path: 'products.productId',
                select: 'name price discount colors variants',
            })
            .populate('userId', 'fullName email phone') // thông tin người dùng
            .lean()
            .sort({ createdAt: -1 });

        // Duyệt từng đơn hàng
        const orders = payments.map((payment) => {
            // Duyệt từng sản phẩm trong đơn hàng
            const items = payment.products
                .map((item) => {
                    const product = item.productId;
                    if (!product) return null;

                    const color = product.colors?.find((c) => c._id.toString() === item.colorId.toString());
                    const variant = product.variants?.find((v) => v._id.toString() === item.sizeId.toString());

                    const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);

                    return {
                        _id: item._id,
                        name: product.name,
                        price: product.price,
                        discount: product.discount || 0,
                        priceAfterDiscount,
                        color: color ? color.name : null,
                        image: color ? color.images : null,
                        size: variant ? variant.size : null,
                        quantity: item.quantity,
                        subtotal: priceAfterDiscount * item.quantity,
                        idProduct: product._id,
                    };
                })
                .filter(Boolean);

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
            .populate('userId', 'fullName email phone') // thông tin người dùng
            .lean()
            .sort({ createdAt: -1 });

        const previewProducts = await PreviewProduct.find({ userId });

        // Duyệt từng đơn hàng
        const orders = payments.map((payment) => {
            // Duyệt từng sản phẩm trong đơn hàng
            const items = payment.products
                .map((item) => {
                    const product = item.productId;
                    if (!product) return null;

                    const color = product.colors?.find((c) => c._id.toString() === item.colorId.toString());
                    const variant = product.variants?.find((v) => v._id.toString() === item.sizeId.toString());
                    const previewProduct = previewProducts.find(
                        (p) => p.productId.toString() === product._id.toString(),
                    );

                    const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);

                    return {
                        _id: item._id,
                        name: product.name,
                        price: product.price,
                        discount: product.discount || 0,
                        priceAfterDiscount,
                        color: color ? color.name : null,
                        image: color ? color.images : null,
                        size: variant ? variant.size : null,
                        quantity: item.quantity,
                        subtotal: priceAfterDiscount * item.quantity,
                        idProduct: product._id,
                        previewProduct: previewProduct,
                    };
                })
                .filter(Boolean);

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
