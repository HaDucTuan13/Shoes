const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPayment = new Schema(
    {
        userId: { type: String, required: true, ref: 'user' },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                colorId: { type: Schema.Types.ObjectId, required: true },
                sizeId: { type: Schema.Types.ObjectId, required: true },
                quantity: { type: Number, required: true, default: 1 },
                name: { type: String },
                price: { type: Number },
                discount: { type: Number, default: 0 },
                priceAfterDiscount: { type: Number },
                colorName: { type: String },
                image: { type: String },
                sizeName: { type: String },
            },
        ],
        totalPrice: { type: Number, require: true },
        fullName: { type: String, require: true },
        phone: { type: String, require: true },
        address: { type: String, require: true },
        finalPrice: { type: Number, default: 0 }, // ✅ giá sau giảm
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: { type: String, enum: ['momo', 'vnpay', 'cod', 'bank'], required: true },
        coupon: {
            code: String,
            discount: Number,
            discountAmount: Number,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('payment', modelPayment);
