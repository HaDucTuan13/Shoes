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
        const newUser = await modelUser.create({
            fullName, email, phone,
            password: passwordHash,
            typeLogin: 'email',
        });
        await createApiKey(newUser._id);
        const token = await createToken({ id: newUser._id });
        const refreshToken = await createRefreshToken({ id: newUser._id });
        return { token, refreshToken };
    }

    async authUser(id) {
        const findUser = await modelUser.findById(id);
        if (!findUser) throw new BadRequestError('User không tồn tại');
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        return auth;
    }

    async login(data) {
        const { email, password } = data;
        const user = await modelUser.findOne({ email });
        if (!user) throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        if (user.typeLogin === 'google') throw new BadRequestError('Tài khoản đăng nhập bằng google');
        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
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
        if (!user) throw new BadRequestError('Tài khoản không tồn tại');
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
        if (!user) throw new BadRequestError('Tài khoản không tồn tại');
        await user.deleteOne();
        return user;
    }

    async changePassword(id, data) {
        const { currentPassword, newPassword } = data;
        const user = await modelUser.findOne({ _id: id });
        if (!user) throw new BadRequestError('Người dùng không tồn tại');
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) throw new BadRequestError('Mật khẩu hiện tại không chính xác');
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
        if (!user) throw new BadRequestError('Người dùng không tồn tại');
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
        if (!user) throw new BadRequestError('Người dùng không tồn tại');
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
        if (!user) throw new BadRequestError('Tài khoản không tồn tại');
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
        if (!user) throw new BadRequestError('Tài khoản không tồn tại');
        const findOtp = await modelOtp.findOne({ email: user.email }).sort({ createdAt: -1 });
        if (!findOtp) throw new BadRequestError('Mã OTP không hợp lệ');
        const checkOtp = bcrypt.compareSync(otpUser, findOtp.otp);
        if (!checkOtp) throw new BadRequestError('Mã OTP không hợp lệ');
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(newPassword, salt);
        user.password = passwordHash;
        await user.save();
        return user;
    }

    async chatbot(question, userId) {
        const response = await askShoeAssistant(question);
        await modelMessageChatbot.create({ userId, sender: 'user', content: question });
        await modelMessageChatbot.create({ userId, sender: 'bot', content: response });
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

            // 1. Tổng quan
            const totalProducts = await Product.countDocuments({ status: 'active' });
            const totalUsers = await User.countDocuments({ isAdmin: false });
            const totalCategories = await Category.countDocuments();
            const totalOrders = await Payment.countDocuments();

            // 2. Tổng doanh thu
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

            // 3. Doanh thu 7 ngày gần đây
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
                    dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                    dayMonth: `${date.getDate()}/${date.getMonth() + 1}`,
                    revenue: existingDay ? existingDay.revenue : 0,
                    orders: existingDay ? existingDay.orders : 0,
                });
            }

            // 4. Trạng thái đơn hàng
            const orderStatus = await Payment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]);

            // 5. Top sản phẩm bán chạy — fix: lookup giá từ product thay vì dùng finalPrice đơn hàng
            const topProducts = await Payment.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $unwind: '$products' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.productId',
                        foreignField: '_id',
                        as: 'productInfo',
                    },
                },
                { $unwind: '$productInfo' },
                {
                    $group: {
                        _id: '$products.productId',
                        totalSold: { $sum: '$products.quantity' },
                        revenue: {
                            $sum: {
                                $multiply: [
                                    '$products.quantity',
                                    {
                                        $subtract: [
                                            '$productInfo.price',
                                            {
                                                $multiply: [
                                                    '$productInfo.price',
                                                    {
                                                        $divide: [
                                                            { $ifNull: ['$productInfo.discount', 0] },
                                                            100,
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                        productName: { $first: '$productInfo.name' },
                        productColors: { $first: '$productInfo.colors' },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
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

            // 8. Phương thức thanh toán
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

            // 9. Tăng trưởng doanh thu so với tháng trước
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

            // 10. Liên hệ chờ xử lý
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
                    revenue: item.revenue,
                    orders: item.orders,
                })),
                orderStatus: orderStatus.map((item) => ({
                    status: item._id,
                    count: item.count,
                })),
                topProducts: topProducts.map((item) => ({
                    id: item._id,
                    name: item.productName,
                    totalSold: item.totalSold,
                    revenue: item.revenue,
                    image: item.productColors?.[0]?.images,
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
        } catch (error) {
            throw new Error(`Error getting dashboard data: ${error.message}`);
        }
    }

    async getRevenueByMonth(month, year) {
        const Payment = require('../models/payment.model');

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const revenueByDay = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate },
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
            { $sort: { '_id.day': 1 } },
        ]);

        const daysInMonth = new Date(year, month, 0).getDate();
        const result = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const found = revenueByDay.find((item) => item._id.day === d);
            result.push({
                day: `${d}/${month}`,
                revenue: found ? found.revenue : 0,
                orders: found ? found.orders : 0,
            });
        }

        const totalRevenue = result.reduce((sum, i) => sum + i.revenue, 0);
        const totalOrders = result.reduce((sum, i) => sum + i.orders, 0);

        return { month, year, totalRevenue, totalOrders, data: result };
    }
}

module.exports = new UserService();