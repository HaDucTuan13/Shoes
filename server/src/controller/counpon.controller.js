const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');
const couponService = require('../services/counpon.service');

class CouponController {
    async create(req, res) {
        const { nameCoupon, discount, quantity, startDate, endDate, minPrice } = req.body;
        if (!nameCoupon || !discount || !quantity || !startDate || !endDate || !minPrice) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const coupon = await couponService.create({
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
        });

        new Created({
            message: 'Tạo mã giảm giá thành công',
            metadata: coupon,
        }).send(res);
    }

    async findAll(req, res) {
        const coupons = await couponService.findAll();
        new OK({
            message: 'Lấy danh sách mã giảm giá thành công',
            metadata: coupons,
        }).send(res);
    }

    async update(req, res) {
        const { id, nameCoupon, discount, quantity, startDate, endDate, minPrice } = req.body;
        if (!id || !nameCoupon || !discount || !quantity || !startDate || !endDate || !minPrice) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const coupon = await couponService.update({
            id,
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
        });

        new OK({
            message: 'Cập nhật mã giảm giá thành công',
            metadata: coupon,
        }).send(res);
    }

    async delete(req, res) {
        const { id } = req.body;
        if (!id) {
            throw new BadRequestError('Vui lòng nhập mã giảm giá');
        }

        await couponService.delete(id);

        new OK({
            message: 'Xóa mã giảm giá thành công',
        }).send(res);
    }

    async findById(req, res) {
        const { id } = req.body;
        if (!id) {
            throw new BadRequestError('Vui lòng nhập mã giảm giá');
        }

        const coupon = await couponService.findById(id);

        new OK({
            message: 'Lấy mã giảm giá thành công',
            metadata: coupon,
        }).send(res);
    }
}

module.exports = new CouponController();
