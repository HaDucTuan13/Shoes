const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelFlashSale = new Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        discount: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('flashSale', modelFlashSale);
