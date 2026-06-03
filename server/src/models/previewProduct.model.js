const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPreviewProduct = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        productId: { type: String, require: true, ref: 'Product' },
        images: { type: [String], require: true },
        rating: { type: Number, require: true },
        comment: { type: String, require: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('previewProduct', modelPreviewProduct);
