const modelCounpon = require('../models/counpon.model');
const modelCart = require('../models/cart.model');

class CouponService {
    async create({ nameCoupon, discount, quantity, startDate, endDate, minPrice }) {
        const coupon = await modelCounpon.create({
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
        });
        return coupon;
    }

    async findAll() {
        const coupons = await modelCounpon.find();
        return coupons;
    }

    async update({ id, nameCoupon, discount, quantity, startDate, endDate, minPrice }) {
        const coupon = await modelCounpon.findByIdAndUpdate(id, {
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
        });
        return coupon;
    }

    async delete(id) {
        const coupon = await modelCounpon.findByIdAndDelete(id);
        return coupon;
    }

    async findById(id) {
        const coupon = await modelCounpon.findOne({ nameCoupon: id });
        return coupon;
    }
}

module.exports = new CouponService();
