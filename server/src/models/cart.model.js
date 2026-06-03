const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelCart = new Schema(
    {
        userId: { type: String, required: true, ref: 'user' },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                colorId: { type: Schema.Types.ObjectId, required: true },
                sizeId: { type: Schema.Types.ObjectId, required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        totalPrice: { type: Number, require: true },
        fullName: { type: String, require: true },
        phone: { type: String, require: true },
        address: { type: String, require: true },
        finalPrice: { type: Number, default: 0 }, // ✅ giá sau giảm
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

module.exports = mongoose.model('cart', modelCart);
