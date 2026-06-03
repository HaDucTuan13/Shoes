const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        nameCoupon: {
            type: String,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        minPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Coupon', couponSchema);
