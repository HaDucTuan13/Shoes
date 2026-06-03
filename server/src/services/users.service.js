const modelUser = require('../models/users.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');
const modelMessageChatbot = require('../models/messageChatbot.model');
const { askShoeAssistant } = require('../utils/chatbot');

const { createToken, createRefreshToken, createApiKey, verifyToken } = require('../utils/jwt');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');

const { ConflictRequestError, BadRequestError } = require('../core/error.response');

const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const SendMailForgotPassword = require('../utils/sendMailForgotPassword');

class UserService {
    async createUser(data) {
        const { fullName, email, password, phone } = data;
        const findUser = await modelUser.findOne({ email });
        if (findUser) {
            throw new ConflictRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);

        // Tạo user mới
        const newUser = await modelUser.create({
            fullName,
            email,
            phone,
            password: passwordHash,
            typeLogin: 'email',
        });

        // Tạo API key và token
        await createApiKey(newUser._id);
        const token = await createToken({ id: newUser._id });
        const refreshToken = await createRefreshToken({ id: newUser._id });

        return { token, refreshToken };
    }

    async authUser(id) {
        const findUser = await modelUser.findById(id);
        if (!findUser) {
            throw new BadRequestError('User không tồn tại');
        }
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        return auth;
    }

    async login(data) {
        const { email, password } = data;
        const user = await modelUser.findOne({ email });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản đăng nhập bằng google');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(user._id);
        const token = await createToken({ id: user._id });
        const refreshToken = await createRefreshToken({ id: user._id });
        return { token, refreshToken };
    }

    async logout(id) {
        await modelApiKey.deleteMany({ userId: id });
        return { status: 200 };
    }

    async refreshToken(refreshToken) {
        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findOne({ _id: decoded.id });

        const token = await createToken({ id: user._id });
        return { token };
    }

    async getAllUser() {
        const data = await modelUser.find();
        return data;
    }

    async updateUserAdmin(id, data) {
        const { fullName, email, phone, address, isAdmin, typeLogin } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        user.fullName = fullName;
        user.email = email;
        user.phone = phone;
        user.address = address;
        user.isAdmin = isAdmin;
        user.typeLogin = typeLogin;
        await user.save();
        return user;
    }

    async deleteUser(id) {
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        await user.deleteOne();
        return user;
    }

    async changePassword(id, data) {
        const { currentPassword, newPassword } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Mật khẩu hiện tại không chính xác');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(newPassword, salt);
        user.password = passwordHash;
        await user.save();
        return user;
    }

    async updateUser(id, data) {
        const { fullName, address, phone, birthDay, email } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.fullName = fullName;
        user.address = address;
        user.phone = phone;
        user.birthDay = birthDay;
        user.email = email;
        await user.save();
        return user;
    }

    async uploadAvatar(id, filename) {
        const user = await modelUser.findOne({ _id: id });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.avatar = filename;
        await user.save();
        return user;
    }

    async loginGoogle(credential) {
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: dataToken.email });

        if (user) {
            await createApiKey(user._id);
            const token = await createToken({ id: user._id });
            const refreshToken = await createRefreshToken({ id: user._id });
            return { token, refreshToken };
        } else {
            const newUser = await modelUser.create({
                email: dataToken.email,
                typeLogin: 'google',
                fullName: dataToken.name,
            });
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            return { token, refreshToken };
        }
    }

    async forgotPassword(email) {
        const user = await modelUser.findOne({ email });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_CRYPTO, { expiresIn: '5m' });

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const saltRounds = 10;

        const otpHash = bcrypt.hashSync(otp, saltRounds);

        await modelOtp.create({ email: user.email, otp: otpHash });

        await SendMailForgotPassword(user.email, otp);

        return { token, otp };
    }

    async resetPassword(token, otpUser, newPassword) {
        const decoded = jwt.verify(token, process.env.SECRET_CRYPTO);
        const user = await modelUser.findOne({ _id: decoded.id });

        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        const findOtp = await modelOtp.findOne({ email: user.email }).sort({ createdAt: -1 });

        if (!findOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }

        const checkOtp = bcrypt.compareSync(otpUser, findOtp.otp);
        if (!checkOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(newPassword, salt);
        user.password = passwordHash;
        await user.save();
        return user;
    }

    async chatbot(question, userId) {
        const response = await askShoeAssistant(question);

        await modelMessageChatbot.create({
            userId: userId,
            sender: 'user',
            content: question,
        });

        await modelMessageChatbot.create({
            userId: userId,
            sender: 'bot',
            content: response,
        });

        return response;
    }

    async getMessageChatbot(userId) {
        const messageChatbot = await modelMessageChatbot.find({ userId });
        return messageChatbot;
    }

    async getDashboardAdmin() {
        try {
            const Product = require('../models/product.model');
            const Payment = require('../models/payment.model');
            const User = require('../models/users.model');
            const PreviewProduct = require('../models/previewProduct.model');
            const Contact = require('../models/contact.model');
            const Category = require('../models/category.model');

            // 1. Tổng quan cơ bản
            const totalProducts = await Product.countDocuments({ status: 'active' });
            const totalUsers = await User.countDocuments({ isAdmin: false });
            const totalCategories = await Category.countDocuments();
            const totalOrders = await Payment.countDocuments();

            console.log('Basic stats:', { totalProducts, totalUsers, totalCategories, totalOrders });

            // Debug: Check sample payment documents
            const samplePayments = await Payment.find()
                .limit(3)
                .select('finalPrice totalPrice status createdAt paymentMethod');
            console.log('Sample payments:', samplePayments);

            // 2. Doanh thu
            const revenueResult = await Payment.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                    then: '$finalPrice',
                                    else: '$totalPrice',
                                },
                            },
                        },
                    },
                },
            ]);
            const totalRevenue = revenueResult[0]?.totalRevenue || 0;
            console.log('Total revenue calculation:', { totalRevenue, revenueResult });

            // 3. Doanh thu theo 7 ngày gần đây
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            console.log('Seven days ago date:', sevenDaysAgo);
            console.log('Current date:', new Date());

            // Simplified query to test data existence first
            const allPayments = await Payment.find({
                status: { $ne: 'cancelled' },
            })
                .select('finalPrice totalPrice status createdAt')
                .limit(5);

            console.log('Sample payments for revenue check:', allPayments);

            // Test revenue calculation logic
            const testRevenueLogic = allPayments.map((payment) => {
                const shouldUseFinalPrice = payment.finalPrice != null && payment.finalPrice > 0;
                const revenueValue = shouldUseFinalPrice ? payment.finalPrice : payment.totalPrice;
                return {
                    id: payment._id,
                    finalPrice: payment.finalPrice,
                    totalPrice: payment.totalPrice,
                    shouldUseFinalPrice,
                    revenueValue,
                };
            });
            console.log('Revenue calculation logic test:', testRevenueLogic);

            const revenueByDay = await Payment.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        revenue: {
                            $sum: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                    then: '$finalPrice',
                                    else: '$totalPrice',
                                },
                            },
                        },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
            ]);

            console.log('Revenue by day query result:', revenueByDay);

            // Generate full 7 days with zero revenue if no data
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                const existingDay = revenueByDay.find(
                    (day) =>
                        day._id.year === date.getFullYear() &&
                        day._id.month === date.getMonth() + 1 &&
                        day._id.day === date.getDate(),
                );

                last7Days.push({
                    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
                    dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }), // Mon, Tue, etc
                    dayMonth: `${date.getDate()}/${date.getMonth() + 1}`, // 14/10
                    revenue: existingDay ? existingDay.revenue : 0,
                    orders: existingDay ? existingDay.orders : 0,
                });
            }

            console.log('Last 7 days with data:', last7Days);

            // Also get all payments within date range to debug
            const paymentsInRange = await Payment.find({
                createdAt: { $gte: sevenDaysAgo },
                status: { $ne: 'cancelled' },
            }).select('createdAt finalPrice totalPrice status');

            console.log('Payments in 7 day range:', paymentsInRange);

            // 4. Trạng thái đơn hàng
            const orderStatus = await Payment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);

            // 5. Top sản phẩm bán chạy
            const topProducts = await Payment.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: '$products.productId',
                        totalSold: { $sum: '$products.quantity' },
                        revenue: {
                            $sum: {
                                $multiply: [
                                    '$products.quantity',
                                    {
                                        $cond: {
                                            if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                            then: '$finalPrice',
                                            else: '$totalPrice',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
            ]);

            // 6. Đánh giá gần đây
            const recentReviews = await PreviewProduct.find()
                .populate('userId', 'fullName avatar')
                .populate('productId', 'name')
                .sort({ createdAt: -1 })
                .limit(5);

            // 7. Đơn hàng mới nhất
            const recentOrders = await Payment.find()
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .limit(10);

            // 8. Thống kê theo phương thức thanh toán
            const paymentMethods = await Payment.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        revenue: {
                            $sum: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                    then: '$finalPrice',
                                    else: '$totalPrice',
                                },
                            },
                        },
                    },
                },
            ]);

            // 9. Tăng trưởng so với tháng trước
            const currentMonth = new Date();
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            const currentMonthRevenue = await Payment.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                            $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                        },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        revenue: {
                            $sum: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                    then: '$finalPrice',
                                    else: '$totalPrice',
                                },
                            },
                        },
                    },
                },
            ]);

            const lastMonthRevenue = await Payment.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
                            $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
                        },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        revenue: {
                            $sum: {
                                $cond: {
                                    if: { $and: [{ $ne: ['$finalPrice', null] }, { $gt: ['$finalPrice', 0] }] },
                                    then: '$finalPrice',
                                    else: '$totalPrice',
                                },
                            },
                        },
                    },
                },
            ]);

            const currentRevenue = currentMonthRevenue[0]?.revenue || 0;
            const lastRevenue = lastMonthRevenue[0]?.revenue || 0;
            const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

            // 10. Liên hệ mới
            const pendingContacts = await Contact.countDocuments({ status: 'pending' });

            return {
                overview: {
                    totalProducts,
                    totalUsers,
                    totalCategories,
                    totalOrders,
                    totalRevenue,
                    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                    pendingContacts,
                },
                revenueByDay: last7Days.map((item) => ({
                    day: item.dayMonth,
                    dayName: item.dayName,
                    date: item.date,
                    revenue: item.revenue,
                    orders: item.orders,
                })),
                orderStatus: orderStatus.map((item) => ({
                    status: item._id,
                    count: item.count,
                })),
                topProducts: topProducts.map((item) => ({
                    id: item._id,
                    name: item.product.name,
                    totalSold: item.totalSold,
                    revenue: item.revenue,
                    image: item.product.colors?.[0]?.images,
                })),
                recentReviews: recentReviews.map((review) => ({
                    id: review._id,
                    user: review.userId?.fullName || 'Ẩn danh',
                    userAvatar: review.userId?.avatar,
                    product: review.productId?.name || 'Sản phẩm đã xóa',
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                })),
                recentOrders: recentOrders.map((order) => ({
                    id: order._id,
                    user: order.fullName,
                    userEmail: order.userId?.email,
                    totalPrice: order.finalPrice || order.totalPrice,
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    createdAt: order.createdAt,
                    itemsCount: order.products.length,
                })),
                paymentMethods: paymentMethods.map((method) => ({
                    method: method._id,
                    count: method.count,
                    revenue: method.revenue,
                })),
            };

            console.log('Final dashboard data:', {
                overview: result.overview,
                revenueByDayCount: result.revenueByDay.length,
                orderStatusCount: result.orderStatus.length,
                topProductsCount: result.topProducts.length,
                paymentMethodsCount: result.paymentMethods.length,
            });

            return result;
        } catch (error) {
            throw new Error(`Error getting dashboard data: ${error.message}`);
        }
    }
}

module.exports = new UserService();
